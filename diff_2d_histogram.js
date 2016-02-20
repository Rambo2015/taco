/**
 * Created by Reem on 12/1/2015.
 */
define(['exports', 'd3', '../caleydo_d3/d3util', './drag', '../caleydo_core/table_impl', '../caleydo_core/idtype'],
  function (exports, d3, d3utils, drag, tables, idtypes) {

    function draw2dHistogram(p_data, id_type, index, usize, parent) {
      var myDrag = drag.Drag();
      var usize0 = usize[0],
        usize1 = usize[1];
      var width = 160, //just to make it look a bit wider than the normal one in case both are selected
        height = 160;

      //d3utils.selectionUtil(i data type, parent, '.taco-2d-container');
      var onClick = function(d,i) {
        id_type.select(0, 'middle-selected', [i], idtypes.toSelectOperation(d3.event));
        //id_type.select(0, 'middle-selected', index, idtypes.toSelectOperation(d3.event));
      };

      //find a better way for calculating the position
      var position = parseInt(parseInt(parent.style("width")) / 2) - parseInt(width / 2);

      var container = parent
        .style("width", width + 2 + 'px')
        .style("height", height + 2 + 'px')
        //todo find an alternative for margin.top here!! or in the other heatmap (special margin)
        //todo move all the transform functions to the css
        //note that the transform has to be one sentence otherwise it won't happen
        .style("transform", "translate(" + position + "px," + 20 + "px)")
        .call(myDrag)
        .on('click', onClick);

      var x = d3.scale.linear()
        .domain([0,1])
        .range([0, width]);

      var y = d3.scale.linear()
          .domain([0, 1])
          .range([0, height]);

      console.log("pdata", p_data);
      var data_list = [];
      data_list.push({
        rows: p_data.rows.d_ratio + p_data.rows.a_ratio + p_data.rows.c_ratio + p_data.rows.no_ratio, //todo change to 1
        cols: p_data.cols.d_ratio + p_data.cols.a_ratio + p_data.cols.c_ratio + p_data.cols.no_ratio, //todo change to 1
        type: "struct-del"
      });
      data_list.push({
        rows: p_data.rows.a_ratio + p_data.rows.c_ratio + p_data.rows.no_ratio, // or 1 - d
        cols: p_data.cols.a_ratio + p_data.cols.c_ratio + p_data.cols.no_ratio,
        type: "struct-add"
      });
      data_list.push({
        rows: p_data.rows.c_ratio + p_data.rows.no_ratio,
        cols: p_data.cols.c_ratio + p_data.cols.no_ratio,
        type: "content-change"
      });
      data_list.push({rows: p_data.rows.no_ratio, cols: p_data.cols.no_ratio, type: "no-change"});
      var bp = container.selectAll("div.bars")
        .data(data_list)
        .enter()
        .append("div")
        .attr("class", function(d){return "bars " + d.type + "-color";}) //todo change this
        .style("height", function(d){
          return y(d.rows) + "px";
        })
        .style("width", function(d){
          return x(d.cols) + "px";
        })
        .attr("title", function(d){return d.rows * 100 + "," + d.cols * 100;});
       // .text( p_data * 100 + "%");
      return container;
    }

    exports.Diff2DHistogramVis = d3utils.defineVis('Diff2DHistogramVis', {}, [200, 200],
      function ($parent, data, size) {
        var o = this.options;
        var $node = $parent.append('div')
          .classed("taco-2d-container", true);
        console.log("selected", o.selected_list[o.index]);
        var some_idtype = idtypes.resolve('_taco_dataset');
        data.data().then(function(ratios){
          console.log(ratios, "from ratios?");
          $node = draw2dHistogram(ratios, some_idtype, o.index, data.desc.size, $node);
        });
        return $node;
      });

    exports.create = function (data, parent, options) {
      return new exports.Diff2DHistogramVis(data, parent, options);
    };
  }
)
;
