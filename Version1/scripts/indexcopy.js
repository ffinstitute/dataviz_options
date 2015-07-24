/**
 * Created by Jean on 13/07/15.
 */

/* jshint browser: true, jquery: true */


;(function($, d3){

    'use strict';

    function CND(x){

        var a1, a2, a3, a4 ,a5, k ;

        a1 = 0.31938153;
        a2 = -0.356563782;
        a3 = 1.781477937;
        a4 = -1.821255978;
        a5 = 1.330274429;

        if(x<0.0)
        {return 1-CND(-x);}
        else
        {k = 1.0 / (1.0 + 0.2316419 * x);
            return 1.0 - Math.exp(-x * x / 2.0)/ Math.sqrt(2*Math.PI) * k * (a1 + k * (a2 + k * (a3 + k * (a4 + k * a5)))) ;
        }
    }

    function SND(x){

        return  Math.exp(-x * x / 2.0)/ Math.sqrt(2*Math.PI);
    }

    function BlackScholes(PutCallFlag, S, K, T, q, r, v) {

        var d1, d2;

        d1 = (Math.log(S / K) + (r - q + v * v / 2.0) * T) / (v * Math.sqrt(T));
        d2 = d1 - v * Math.sqrt(T);

        if (PutCallFlag === 'c'){
            return Math.exp(-q*T) * S * CND(d1) - Math.exp(-r*T) * K * CND(d2);
        }
        else{
            return Math.exp(-r*T) * K * CND(-d2) - Math.exp(-q*T) * S * CND(-d1);
        }
    }

    function Forward(S, T, q, r){
        return S * Math.exp((r-q)*T);
    }

    function Delta(PutCallFlag, S, K, T, q, r, v) {

        var d1;

        d1 = (Math.log(S / K) + (r - q + v * v / 2.0) * T) / (v * Math.sqrt(T));

        if (PutCallFlag === 'c'){
            return Math.exp(-q*T) * CND(d1);
        }
        else{
            return -Math.exp(-q*T) * CND(-d1);
        }
    }

    function Gamma(S, K, T, q, r, v) {

        var d1, d2;

        d1 = (Math.log(S / K) + (r - q + v * v / 2.0) * T) / (v * Math.sqrt(T));
        d2 = d1 - v * Math.sqrt(T);

        return Math.exp(-r*T) * SND(d1) / (S*v*Math.sqrt(T));

    }

    function Vega(S, K, T, q, r, v){

        var d1;

        d1 = (Math.log(S / K) + (r - q + v * v / 2.0) * T) / (v * Math.sqrt(T));

        return S * Math.exp(-q * T) * SND(d1) * Math.sqrt(T);
        // Or return K * Math.exp(-r * T) * SND(d2) * Math.sqrt(T);

    }

    function Rho(PutCallFlag, S, K, T, q, r, v){

        var d1, d2;

        d1 = (Math.log(S / K) + (r - q + v * v / 2.0) * T) / (v * Math.sqrt(T));
        d2 = d1 - v * Math.sqrt(T);

        if (PutCallFlag === 'c'){
            return K * T * Math.exp(-r * T) * CND(d2);
        }
        else{
            return -K * T * Math.exp(-r * T) * CND(-d2);
        }

    }

  $(document).ready(function(){

      $('#sliderStock').slider({
          range: 'max',
          min: 1,
          max: 200,
          step: 1,
          value: 100,
          slide: function( event, ui ) {
              $('#Stock span').html(ui.value);
          },
          change:function(){update();}
      });

      $('#sliderStrike').slider({
          range: 'max',
          min: 1,
          max: 200,
          step: 1,
          value: 100,
          //handle:
          slide: function( event, ui ) {
              $('#Strike span').html(ui.value);
          },
          change:function(){update();}
      });

      $('#sliderRisk').slider({
          range: 'max',
          min: -0.1,
          max: 0.1,
          step: 0.005,
          value: 0.0,
          //handle:
          slide: function( event, ui ) {
              $('#Risk span').html(Math.round(ui.value * 10000) / 100);
          },
          change:function(){update();}
      });

      $('#sliderDividend').slider({
          range: 'max',
          min: -0.1,
          max: 0.1,
          step: 0.005,
          value: 0.0,
          //handle: '#00297B',
          slide: function( event, ui ) {
              $('#Dividend span').html(Math.round(ui.value * 10000) / 100);
          },
          change:function(){update();}
      });

      $('#sliderMaturity').slider({
          range: 'max',
          min: 0,
          max: 5,
          step: 0.1,
          value: 2.5,
          slide: function( event, ui ) {
                $('#Maturity span').html(ui.value);
          },
          change: function(){update();}
      });

      $('#sliderVolatility').slider({
          range: 'max',
          min: 0.05,
          max: 0.5,
          step: 0.01,
          value: 0.4,
          //handle:
          slide: function ( event, ui ) {
              $('#Volatility span').html(Math.round(ui.value * 10000) / 100);
          },
          change:function(){update();}
      });

      setTimeout(update,10);

      $('.ui-slider').css('background','#00297B');

      $('.ui-slider-handle').css('border-color', '#00297B');

      $('#btnCall').addClass('active');

      // $('#btnValue').addClass('active');

  });

    $('#btnReset').click(function(){
        $('#sliderStock').slider('value', 100 );
        $('#sliderStrike').slider('value', 100 );
        $('#sliderRisk').slider('value', 0.0 );
        $('#sliderDividend').slider('value', 0.0 );
        $('#sliderMaturity').slider('value', 2.5 );
        $('#sliderVolatility').slider('value', 0.4 );
    });

    var callPremium, putPremium, callDelta, putDelta, callRho, putRho, spotForward, spotGamma, spotVega;

    function update (){
        
       var Stock = $('#sliderStock').slider('value');
       var Strike = $('#sliderStrike').slider('value');
       var Mat = $('#sliderMaturity').slider('value');
       var R = $('#sliderRisk').slider('value');
       var Q = $('#sliderDividend').slider('value');
       var Vol = $('#sliderVolatility').slider('value');

       var Drift = Q - R;

        spotForward = Forward(Stock, Mat, Q, R);

        spotGamma = Gamma(Stock, Strike, Mat, R, Q, Vol);

        spotVega = Vega(Stock, Strike, Mat, R, Q, Vol);

        callPremium = BlackScholes('c', Stock, Strike, Mat, R, Q, Vol);

        putPremium = BlackScholes('p', Stock, Strike, Mat, R, Q, Vol);

        callDelta = Delta('c', Stock, Strike, Mat, R, Q, Vol);

        putDelta = Delta('p', Stock, Strike, Mat, R, Q, Vol);

        callRho = Rho('c', Stock, Strike, Mat, R, Q, Vol);

        putRho = Rho('p', Stock, Strike, Mat, R, Q, Vol);

        $('#Stock span').html(Stock);
        $('#Strike span').html(Strike);
        $('#Risk span').html(1000 * R / 10);
        $('#Dividend span').html(1000 * Q / 10);
        $('#Maturity span').html(Mat);
        $('#Volatility span').html(1000 * Vol / 10);

        $('#Drift span').html(Math.round(10000 * Drift)/100);
        $('#Forward span').html(Math.round(100 * spotForward)/100);

        //window.console.log(Math.round(100 * spotForward)/100, spotForward);

        $('#Gamma span').html(Math.round(10000 * spotGamma)/10000);
        $('#Vega span').html(Math.round(100 * spotVega)/100);

        $('#callPremium span').html(Math.round(callPremium*100)/100);
        $('#callPremiumPct span').html(Math.round(callPremium/Stock*10000)/100);
        $('#callDelta span').html(Math.round(callDelta*10000)/10000);
        $('#callRho span').html(Math.round(callRho*10000)/10000);

        $('#putPremium span').html(Math.round(putPremium*100)/100);
        $('#putPremiumPct span').html(Math.round(putPremium/Stock*10000)/100);
        $('#putDelta span').html(Math.round(putDelta*10000)/10000);
        $('#putRho span').html(Math.round(putRho*10000)/10000);


        /*  xScale.domain([0, 2 * Strike]);
        yScale1.domain([Strike, 0]);
        yScale2.domain([2, 0]);
        yScale3.domain([0.3, 0]);
        yScale4.domain([130, 0]);
        //yScale5.domain([, 0]);

        plot(); */
    }


    var canvas1 = d3.select('#mainGraph')
                    .append('svg')
                    .attr('width', 410)
                    .attr('height', 205);

    var rectangle1 = canvas1.append('rect').attr('width', 410).attr('height', 205);

    var canvas2 = d3.select('#deltaGraph')
                    .append('svg')
                    .attr('width', 410)
                    .attr('height', 205);

    var rectangle2 = canvas2.append('rect').attr('width', 410).attr('height', 205);

    var canvas3 = d3.select('#gammaGraph')
        .append('svg')
        .attr('width', 410)
        .attr('height', 205);

    var rectangle3 = canvas3.append('rect').attr('width', 410).attr('height', 205);

    var canvas4 = d3.select('#gammaGraph')
        .append('svg')
        .attr('width', 410)
        .attr('height', 205);

    var rectangle4 = canvas4.append('rect').attr('width', 410).attr('height', 205);

    var canvas5 = d3.select('#gammaGraph')
        .append('svg')
        .attr('width', 410)
        .attr('height', 205);

    var rectangle5 = canvas5.append('rect').attr('width', 410).attr('height', 205);

}(jQuery, window.d3));

