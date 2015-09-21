/**
 * Created by Reem and Sam on 9/17/2015.
 */
define(['exports', 'd3', '../caleydo_d3/d3util'], function (exports, d3, d3utils) {
    //draws the barplot based on the projected data
    function drawDiffBarplot(p_data, usize, parent, dim, data_promise) {
      var usize0 = usize[0],
        usize1 = usize[1],
        is_cols = false;
      if (dim[0] !== "rows"){
        usize0 = usize[1];
        usize1 = usize[0];
        is_cols = true;
      }
      var  gridSize = 6,
        //todo we could use the width of the max value
        width = (usize1 * gridSize),
        height = (usize0 * gridSize);


      /*
       var x = d3.scale.ordinal()
       .rangeRoundBands([0, width], .1);

       var y = d3.scale.linear()
       .rangeRound([height, 0]);

       var color = d3.scale.ordinal()
       .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

       var xAxis = d3.svg.axis()
       .scale(x)
       .orient("bottom");

       var yAxis = d3.svg.axis()
       .scale(y)
       .orient("left")
       .tickFormat(d3.format(".2s"));
       */

      //dragging
      var drag = d3.behavior.drag()
        //.on('dragstart', function() { console.log("start") })
        .on('drag', dragHandler);
        //.on('dragend', function() { console.log("end") });

      //todo to use just the one in heatmap
      function dragHandler(d) {
        //must have position absolute to work like this
        //otherwise use transfrom css property
        d3.select(this)
          .style("left", (this.offsetLeft + d3.event.dx) + "px")
          .style("top", (this.offsetTop + d3.event.dy) + "px");
      }

      console.log("usize", usize0, "direction", dim, data_promise);
      //to check which direction and which size we need to use
      //if (len(dim) === 1){

      //}
      var position = parseInt(parseInt(d3.select("#board").style("width")) / 2) - parseInt(width / 2);

      var container = parent.append("div")
        .classed("taco-bp-container", true)
        .classed("rotated", is_cols)
        .style("width", width + 2 + 'px')
        .style("height", height + 2 + 'px')
        //todo find an alternative for margin.top here!! or in the other heatmap (special margin)
        //todo move all the transform functions to the css
        //note that the transform has to be one sentence otherwise it won't happen
        .style("transform", "translate(" + position + "px," + 20 + "px)" + (is_cols ? "rotate(90deg) scaleY(-1)" : ""))
        .call(drag);


      //http://bost.ocks.org/mike/bar/
      var x = d3.scale.linear()
        .domain([0, usize1])
        .range([0, width]);

      var y = d3.scale.linear()
        .domain([0, usize0])
        .range([0, height]);


      var bp = container.selectAll("div.rows")
        .data(p_data, function (d, i) {
          console.log(d);
          return d.id;
        });

      bp.enter().append("div")
        .classed("rows", true)
        .style("width", function (d) {
          return x(d.count) + "px";
        })
        .style("height", gridSize + "px")
        //.text(function (d) {return d.id;})
        .style("transform", function(d){ return "translate(" + 0 + "px," + y(d.pos) + "px)";});


      /*
       var svg = d3.select("body").append("svg")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

       var root = d3.selectAll("idk").data(p_data).enter();

       color.domain(d3.keys(data[0]).filter(function (key) {
       return key !== "State";
       }));

       data.forEach(function (d) {
       var y0 = 0;
       d.ages = color.domain().map(function (name) {
       return {name: name, y0: y0, y1: y0 += +d[name]};
       });
       d.total = d.ages[d.ages.length - 1].y1;
       });

       data.sort(function (a, b) {
       return b.total - a.total;
       });

       x.domain(data.map(function (d) {
       return d.State;
       }));
       y.domain([0, d3.max(data, function (d) {
       return d.total;
       })]);

       svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis);

       svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".71em")
       .style("text-anchor", "end")
       .text("Population");

       var state = svg.selectAll(".state")
       .data(data)
       .enter().append("g")
       .attr("class", "g")
       .attr("transform", function (d) {
       return "translate(" + x(d.State) + ",0)";
       });

       state.selectAll("rect")
       .data(function (d) {
       return d.ages;
       })
       .enter().append("rect")
       .attr("width", x.rangeBand())
       .attr("y", function (d) {
       return y(d.y1);
       })
       .attr("height", function (d) {
       return y(d.y0) - y(d.y1);
       })
       .style("fill", function (d) {
       return color(d.name);
       });
       */
      return container; //?
    }

    exports.DiffBarPlotVis = d3utils.defineVis('DiffBarPlotVis', {
        dim: 'column'
      }, [200, 200],
      function ($parent, data, size) {
        var o = this.options;
        //var $node = $parent.append('pre');
        var $node = $parent;

        console.log("o", o, "desc", data.desc);
        //todo change this so that it consider the case of both rows and cols at the same time
        data.dimStats(data.desc.direction[0]).then(function (stats) {
          //$node.text(JSON.stringify(stats, null, ' '));
          $node = drawDiffBarplot(stats, data.desc.size, $parent, data.desc.direction, data.data());
        });
        return $node;
      });

    exports.create = function (data, parent, options) {
      return new exports.DiffBarPlotVis(data, parent, options);
    };
  }
)
;
