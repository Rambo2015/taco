/**
 * Created by Reem on 6/15/2015.
 */

define(["require", "exports", 'd3'],
  function (require, exports, d3) {

    function DifflogParser(diff_file) {
      this.filepath = diff_file;
      this.diff_arrays = {
        added_rows: [],
        deleted_rows: [],
        added_cols: [],
        deleted_cols: []
      };
    }

    DifflogParser.prototype.getDiff = function(){
      var that = this;

      var promise = new Promise(function(resolve, reject){
        d3.tsv(that.filepath, function (data) {
          data.forEach(function (d) {
            /*operation: d.operation,
             type: d.type,
             id: d.id, // TODO: consider that the change operation returns 2 values here
             position: d.position // convert to number use: +d.position*/
            if (d.operation == "add") {
              if (d.type == 'column') {
                that.diff_arrays.added_cols.push(d.id);
              } else if (d.type == 'row') {
                that.diff_arrays.added_rows.push(d.id);
              }
            } else if (d.operation == "delete") {
              if (d.type == 'column') {
                that.diff_arrays.deleted_cols.push(d.id);
              } else if (d.type == 'row') {
                that.diff_arrays.deleted_rows.push(d.id);
              }
            }
          });
          resolve(that.diff_arrays);
          //reject(err)
        });
      });

      return promise;
    };

    exports.create = function(diff_file){
      return new DifflogParser(diff_file);
    };

  });
