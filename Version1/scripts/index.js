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

    var width = $('#divGraphs .panel-body').width(),
        height = 950;

    var svg = d3.select('#allGraphs')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    var xScale = d3.scale.linear().range([40, width-40]);

    var yScale1 = d3.scale.linear().range([20, 200]),
        yScale2 = d3.scale.linear().range([260, 380]),
        yScale3 = d3.scale.linear().range([440, 560]),
        yScale4 = d3.scale.linear().range([620, 740]),
        yScale5 = d3.scale.linear().range([800, 920]);

    function plotTitles (){

        svg.append('text')
            .text('Pay-out and Option Value')
            .attr('x', width/4)
            .attr('y', 30)
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .attr('fill', 'gray');

        svg.append('text')
            .text('Delta')
            .attr('x', width/4)
            .attr('y', 270)
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .attr('fill','gray');

        svg.append('text')
            .text('Gamma')
            .attr('x', width/4)
            .attr('y', 450)
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .attr('fill','gray');

        svg.append('text')
            .text('Vega')
            .attr('x', width/4)
            .attr('y', 630)
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .attr('fill','gray');

        svg.append('text')
            .text('Rho')
            .attr('x', width/4)
            .attr('y', 810)
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .attr('fill','gray');

    }

    function callCurve(K, T, q, r, v){

        callLineData = [];

        for (var i = 0; i < width ; i +=2) {

            var x = i  * 2 *  K / width;

            var y = BlackScholes('c', x, K, T, q, r, v);

            var delta = Delta('c', x, K, T, q, r, v);
            //  var highlight = function(t){if (Math.round(t)==Spot) {return 1} else {return 0}};

            var gamma = Gamma(x, K, T, q, r, v);

            var vega = Vega(x, K, T, q, r, v);

            var rho = Rho('c', x, K, T, q, r, v);

            //console.log( Math.round(x), y, optionvalue, highlight(x));
            //window.console.log(delta, yScale2(1 - delta), (1.5 * uh + + bottomPadding + topPadding)-yScale2(1 - delta)) ;

            //var curves = [x, y, delta, gamma, vega, rho];
            var curves = [xScale(x), yScale1(y), yScale2(delta), yScale3(gamma), yScale4(vega), yScale5(rho)];
            //var curves = {'x': x,'y': y,'delta': delta, 'gamma': gamma, 'vega': vega, 'rho': rho};
            callLineData.push(curves);

        }

        window.console.log(callLineData);

        return callLineData;

    }

    function plotGraphs (){

        var linePremium = svg.selectAll('.a').data(callLineData),
            lineDelta = svg.selectAll('.b').data(callLineData),
            lineGamma = svg.selectAll('.c').data(callLineData),
            lineVega = svg.selectAll('.d').data(callLineData),
            lineRho = svg.selectAll('.e').data(callLineData);

        linePremium.enter()
            .append('circle')
            .attr('class', 'a')
            .attr('r', 2)
            .attr('cx', function(d) {return d[0];})
            .attr('cy', function(d) {return d[1];})
            .append('title').text(function(d,i){return i+':'+d[0]+'x'+d[1];});

        linePremium.transition(1000).delay(300)
            .attr('r', 2)
            .attr('cx', function(d) {return d[0];})
            .attr('cy', function(d) {return d[1];});

        linePremium.exit().remove();

        lineDelta.enter()
            .append('circle')
            .attr('class', 'b')
            .attr('r', 2)
            .attr('cx', function(d) {return d[0];})
            .attr('cy', function(d) {return d[2];})
            .append('title').text(function(d,i){return i+':'+d[0]+'x'+d[2];});

        lineDelta.transition(1000).delay(300)
            .attr('r', 2)
            .attr('cx', function(d) {return d[0];})
            .attr('cy', function(d) {return d[2];});

        lineDelta.exit().remove();

        lineGamma.enter()
            .append('circle')
            .attr('class', 'c')
            .attr('r', 2)
            .attr('cx', function(d) {return d[0];})
            .attr('cy', function(d) {return d[3];})
            .append('title').text(function(d,i){return i+':'+d[0]+'x'+d[3];});

        lineGamma.transition(1000).delay(300)
            .attr('r', 2)
            .attr('cx', function(d) {return d[0];})
            .attr('cy', function(d) {return d[3];});

        lineGamma.exit().remove();

        lineVega.enter()
            .append('circle')
            .attr('class', 'd')
            .attr('r', 2)
            .attr('cx', function(d) {return d[0];})
            .attr('cy', function(d) {return d[4];})
            .append('title').text(function(d,i){return i+':'+d[0]+'x'+d[4];});

        lineVega.transition(1000).delay(300)
            .attr('r', 2)
            .attr('cx', function(d) {return d[0];})
            .attr('cy', function(d) {return d[4];});

        lineVega.exit().remove();

        lineRho.enter()
            .append('circle')
            .attr('class', 'e')
            .attr('r', 2)
            .attr('cx', function(d) {return d[0];})
            .attr('cy', function(d) {return d[5];})
            .append('title').text(function(d,i){return i+':'+d[0]+'x'+d[5];});

        lineRho.transition(1000).delay(300)
            .attr('r', 2)
            .attr('cx', function(d) {return d[0];})
            .attr('cy', function(d) {return d[5];});

        lineRho.exit().remove();

        svg.selectAll('g').remove();

        var xAxis1 = d3.svg.axis()
            .ticks(10)
            .scale(xScale)
            .orient('bottom');

        svg.append('g')
            .attr('class','axis')
            .attr('transform', 'translate(' + 0 + ',' + 200 + ')')
            .call(xAxis1);

        svg.append('g')
            .attr('class','axis')
            .attr('transform', 'translate(' + 0 + ',' + 380 + ')')
            .call(xAxis1);

        svg.append('g')
            .attr('class','axis')
            .attr('transform', 'translate(' + 0 + ',' + 560 + ')')
            .call(xAxis1);

        svg.append('g')
            .attr('class','axis')
            .attr('transform', 'translate(' + 0 + ',' + 740 + ')')
            .call(xAxis1);

        svg.append('g')
            .attr('class','axis')
            .attr('transform', 'translate(' + 0 + ',' + 920 + ')')
            .call(xAxis1);

        var yAxis1 = d3.svg.axis()
            .ticks(5)
            .scale(yScale1)
            .orient('left');

        svg.append('g')
            .attr('class','axis')
            .attr('transform', 'translate(' + 40 + ', ' + 0 + ')')
            .call(yAxis1);

        var yAxis2 = d3.svg.axis()
            .ticks(5)
            .scale(yScale2)
            .orient('left');

        svg.append('g')
            .attr('class','axis')
            .attr('transform', 'translate(' + 40 + ', ' + 0 + ')')
            .call(yAxis2);

        var yAxis3 = d3.svg.axis()
            .ticks(5)
            .scale(yScale3)
            .orient('left');

        svg.append('g')
            .attr('class','axis')
            .attr('transform', 'translate(' + 40 + ', ' + 0 + ')')
            .call(yAxis3);

        var yAxis4 = d3.svg.axis()
            .ticks(5)
            .scale(yScale4)
            .orient('left');

        svg.append('g')
            .attr('class','axis')
            .attr('transform', 'translate(' + 40 + ', ' + 0 + ')')
            .call(yAxis4);

        var yAxis5 = d3.svg.axis()
            .ticks(5)
            .scale(yScale5)
            .orient('left');

        svg.append('g')
            .attr('class','axis')
            .attr('transform', 'translate(' + 40 + ', ' + 0 + ')')
            .call(yAxis5);

    }

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

        xScale.domain([0, 2 * Strike]);
        yScale1.domain([Strike, 0]);
        yScale2.domain([2, 0]);
        yScale3.domain([0.1, 0]);
        yScale4.domain([130, 0]);
        yScale5.domain([400, 0]);

        callCurve(Strike, Mat, Q, R, Vol);

        plotGraphs();

        plotSpot();

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
          slide: function ( event, ui ) {
              $('#Volatility span').html(Math.round(ui.value * 10000) / 100);
          },
          change:function(){update();}
      });

      setTimeout(update,10);

      $('.ui-slider').css('background','#00297B');

      $('.ui-slider-handle').css('border-color', '#00297B');

      plotTitles();

  });

    $('#btnReset').click(function(){
        $('#sliderStock').slider('value', 100 );
        $('#sliderStrike').slider('value', 100 );
        $('#sliderRisk').slider('value', 0.0 );
        $('#sliderDividend').slider('value', 0.0 );
        $('#sliderMaturity').slider('value', 2.5 );
        $('#sliderVolatility').slider('value', 0.4 );
    });
    $('.carousel').carousel({
        interval: 6000,
        pause: 'hover'
    });

    var callLineData = [];

    function plotSpot(){

        /*var circlePremium = svg.selectAll('.circle-a'),
            circleGamma = svg.selectAll('circle-c'),
            circleVega = svg.selectAll('circle-d'),
            circleRho = svg.selectAll('circle-e');

        svg.append('circle')
            .attr('class', 'circle-a')
            .attr('r', 4)
            .attr('cx', xScale($('#sliderStock').slider('value')))
            .attr('cy', yScale1(callPremium));

        circlePremium
            .transition(1000).delay(300)
            .attr('r', 4)
            .attr('cx', xScale($('#sliderStock').slider('value')))
            .attr('cy', yScale1(callPremium));

        svg.append('circle')
            .attr('class', 'circle-c')
            .attr('r', 4)
            .attr('cx', xScale($('#sliderStock').slider('value')))
            .attr('cy', yScale3(spotGamma));

        circleGamma
            .transition(1000).delay(300)
            .attr('r', 4)
            .attr('cx', xScale($('#sliderStock').slider('value')))
            .attr('cy', yScale3(spotGamma));

        svg.append('circle')
            .attr('class', 'circle-d')
            .attr('r', 4)
            .attr('cx', xScale($('#sliderStock').slider('value')))
            .attr('cy', yScale4(spotVega));

        circleVega
            .transition(1000).delay(300)
            .attr('r', 4)
            .attr('cx', xScale($('#sliderStock').slider('value')))
            .attr('cy', yScale4(spotVega));

        svg.append('circle')
            .attr('class', 'circle-e')
            .attr('r', 4)
            .attr('cx', xScale($('#sliderStock').slider('value')))
            .attr('cy', yScale5(callRho));

        circleRho
            .transition(1000).delay(300)
            .attr('r', 4)
            .attr('cx', xScale($('#sliderStock').slider('value')))
            .attr('cy', yScale5(callRho));

        var tangent = svg.selectAll('.lineTemoin')

        svg.append('line')
            .attr('class','lineTemoin')
            .attr('x1', xScale($('#sliderStock').slider('value')) - 50)
            .attr('y1', yScale1(callPremium) + 50 * callDelta)
            .attr('x2', xScale($('#sliderStock').slider('value')) + 50)
            .attr('y2', yScale1(callPremium) - 50 * callDelta);

        tangent
            .transition(1000).delay(300)
            .attr('x1', xScale($('#sliderStock').slider('value')) - 60)
            .attr('y1', yScale1(callPremium)  + 50 * callDelta )
            .attr('x2', xScale($('#sliderStock').slider('value')) + 50)
            .attr('y2', yScale1(callPremium) - 50 * callDelta);

        svg.append('line')
            .attr('class','lineCoordinates')
            .attr('x1', xScale(0))
            .attr('y1', yScale1(callPremium))
            .attr('x2', xScale($('#sliderStock').slider('value')))
            .attr('y2', yScale1(callPremium));

        linePremium(y)*/

    }

}(window.jQuery, window.d3));