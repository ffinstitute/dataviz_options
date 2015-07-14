/**
 * Created by Jean on 13/07/15.
 */

/* jshint browser: true, jquery: true */

;(function($, d3){

    'use strict';

  $(document).ready(function(){

      $('#stock').slider({
          min: 1,
          max: 20,
          step: 1,
          change:function(){update();}
      });

      $('#strike').slider({
          min: 1,
          max: 20,
          step: 1
      });

      $('#risk').slider({
          min: 1,
          max: 20,
          step: 1
      });

      $('#dividend').slider({
          min: 1,
          max: 20,
          step: 1
      });

      $('#maturity').slider({
          min: 1,
          max: 20,
          step: 1
      });

      $('#volatility').slider({
          min: 1,
          max: 20,
          step: 1
      });


  });



}(jQuery, window.d3));

