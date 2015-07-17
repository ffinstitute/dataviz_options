/**
 * Created by Jean on 13/07/15.
 */

/* jshint browser: true, jquery: true */

;(function($, d3){

    'use strict';

    var S, K, T, q, r, v;

    var d1, d2;
    d1 = (Math.log(S / K) + (r - q + v * v / 2.0) * T) / (v * Math.sqrt(T));
    d2 = d1 - v * Math.sqrt(T);

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


    function BlackScholes(PutCallFlag, S, K, T, q, r) {

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

    function Delta(PutCallFlag, T, q) {

        if (PutCallFlag === 'c'){
            return Math.exp(-q*T) * CND(d1);
        }
        else{
            return -Math.exp(-q*T) * CND(-d1);
        }
    }

    function Gamma(S, T, r, v) {

        return Math.exp(-r*T) * SND(d1) / (S*v*Math.sqrt(T));

    }

    function Vega(S, T, q){

        return S * Math.exp(-q * T) * SND(d1) * Math.sqrt(T);
        // Or return K * Math.exp(-r * T) * SND(d2) * Math.sqrt(T);

    }

    function Rho(PutCallFlag, K, T, r){

        if (PutCallFlag === 'c'){
            return K * T * Math.exp(-r * T) * CND(d2);
        }
        else{
            return -K * T * Math.exp(-r * T) * CND(-d2);
        }

    }

  $(document).ready(function(){

      $('#sliderStock').slider({
          min: 1,
          max: 200,
          step: 1,
          value: 100,
          change:function(){update();}
      });

      $('#sliderStrike').slider({
          min: 1,
          max: 200,
          step: 1,
          value: 100,
          change:function(){update();}
      });

      $('#sliderRisk').slider({
          min: -0.1,
          max: 0.1,
          step: 0.005,
          value: 0.0,
          change:function(){update();}
      });

      $('#sliderDividend').slider({
          min: -0.1,
          max: 0.1,
          step: 0.005,
          value: 0.0,
          change:function(){update();}
      });

      $('#sliderMaturity').slider({
          min: 0,
          max: 5,
          step: 0.1,
          value: 2.5,
          change:function(){update();}
      });

      $('#sliderVolatility').slider({
          min: 0.05,
          max: 0.5,
          step: 0.01,
          value: 0.4,
          change:function(){update();}
      });

      setTimeout(update,10);

  });

    $('#btnReset').click(function(){
        $('#sliderStock').slider('value', 100 );
        $('#sliderStrike').slider('value', 100 );
        $('#sliderRisk').slider('value', 0.0 );
        $('#sliderDividend').slider('value', 0.0 );
        $('#sliderMaturity').slider('value', 2.5 );
        $('#sliderVolatility').slider('value', 0.4 );
    });

    /* $('#btnCall').click(function(){

    });                                     // TODO: Configure 'Call' and 'Put' buttons

    $('btnPut').click(function(){

    });

    $('#btnValue').click(function(){});     // TODO: Configure buttons to switch graphs
    $('#btnDelta').click(function(){});
    $('#btnGamma').click(function(){});
    $('#btnVega').click(function(){});
    $('#btnRho').click(function(){});   */

    var callPremium, putPremium, callDelta, putDelta, callRho, putRho, spotForward, spotGamma, spotVega;

    function update (){
        
       var Stock = $('#sliderStock').slider('value');
       var Strike = $('#sliderStrike').slider('value');
       var Mat = $('#sliderMaturity').slider('value');
       var R = $('#sliderRisk').slider('value');
       var Q = $('#sliderDividend').slider('value');
       var Vol = $('#sliderVolatility').slider('value');

       var Drift = Q - R;

        spotForward = new Forward(Stock, Mat, Q, R);

        spotGamma = new Gamma(Stock, Mat, R, Vol);

        spotVega = new Vega(Stock, Mat, Q);

        callPremium = new BlackScholes('c', Stock, Strike, Mat, Q, R);

        putPremium = new BlackScholes('p', Stock, Strike, Mat, Q, R);

        callDelta = new Delta('c', Mat, Q);

        putDelta = new Delta('p', Mat, Q);

        callRho = new Rho('c', Strike, Mat, R);

        putRho = new Rho('p', Strike, Mat, R);

        $('#Stock span').html(Stock);
        $('#Strike span').html(Strike);
        $('#Risk span').html(100 * R);
        $('#Dividend span').html(100 * Q);
        $('#Maturity span').html(Mat);
        $('#Volatility span').html(100*Vol);

        $('#Drift span').html(Math.round(10000*Drift)/100);
        $('#Forward span').html(Math.round(100*spotForward)/100);

        //$('#Gamma span').html(Math.round()/);




       /* $('#callPremium span').html(Math.round(callPremium*100)/100);
        $('#callPremiumPct span').html(Math.round(callPremium/Spot*10000)/100);     TODO: Work on the "Call" and "Put" buttons
        $('#putPremium span').html(Math.round(putPremium*100)/100);
        $('#putPremiumPct span').html(Math.round(putPremium/Spot*10000)/100);

        $('#callDelta span').html(Math.round(callDelta*10000)/10000);
        $('#putDelta span').html(Math.round(putDelta*10000)/10000); */

        window.console.log('hello');
    }

}(jQuery, window.d3));

