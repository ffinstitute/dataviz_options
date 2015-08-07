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

        svg.selectAll('text').remove();

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

    var callLineData = [];

    function callCurve(K, T, q, r, v){

        callLineData = [];

        for (var i = 0; i < width ; i +=2) {

            var x = i  * 2 *  K / width;

            var y, delta, gamma, vega, rho;

            if (isNaN(BlackScholes('c',x, K, T, q, r, v)) === true) {
                y = 0;
            }   else{
                y = BlackScholes('c',x, K, T, q, r, v);
            }

            if (isNaN(Delta('c',x, K, T, q, r, v)) === true) {
                delta = 0;
            }   else{
                delta = Delta('c',x, K, T, q, r, v);
            }

            if (isNaN(Gamma(x, K, T, q, r, v)) === true) {
                gamma = 0;
            }   else{
                gamma = Gamma(x, K, T, q, r, v);
            }

            if (isNaN(Vega(x, K, T, q, r, v)) === true) {
                vega = 0;
            }   else{
                vega = Vega(x, K, T, q, r, v);
            }

            if (isNaN(Rho('c',x, K, T, q, r, v)) === true) {
                rho = 0;
            }   else{
                rho = Rho('c',x, K, T, q, r, v);
            }

            var data = {'x': x,'y': y,'delta': delta, 'gamma': gamma, 'vega': vega, 'rho': rho};
            callLineData.push(data);

        }

        return callLineData;

    }

    var pullLineData = [];

    function putCurve (K, T, q, r, v){

        pullLineData = [];

        for (var i = 0; i < width ; i +=2) {

            var x = i  * 2 *  K / width;

            var y, delta, gamma, vega, rho;

            if (isNaN(BlackScholes('p',x, K, T, q, r, v)) === true) {
                y = 0;
            }   else{
                y = BlackScholes('p',x, K, T, q, r, v);
            }

            if (isNaN(Delta('p',x, K, T, q, r, v)) === true) {
                delta = 0;
            }   else{
                delta = Delta('p',x, K, T, q, r, v);
            }

            if (isNaN(Gamma(x, K, T, q, r, v)) === true) {
                gamma = 0;
            }   else{
                gamma = Gamma(x, K, T, q, r, v);
            }

            if (isNaN(Vega(x, K, T, q, r, v)) === true) {
                vega = 0;
            }   else{
                vega = Vega(x, K, T, q, r, v);
            }

            if (isNaN(Rho('p',x, K, T, q, r, v)) === true) {
                rho = 0;
            }   else{
                rho = Rho('p',x, K, T, q, r, v);
            }

            var data2 = {'x': x,'y': y,'delta': delta, 'gamma': gamma, 'vega': vega, 'rho': rho};
            pullLineData.push(data2);

        }

        return pullLineData;
    }

    function plotAxes (){

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
            //.tickSize(80-width)
            //.tickFormat(d3.format('s'))
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

        svg.selectAll('.axis line, .axis path')
            .style({ 'fill': 'none', 'stroke-width': '1', 'stroke': 'darkgray', 'shape-rendering': 'crispEdges'});
    }

    function plotGraphs (){

        var linePremium = d3.svg.line()
                .x(function(d){ return xScale(d.x); })
                .y(function(d){ return yScale1(d.y); }),

            lineDelta = d3.svg.line()
                .x(function(d){ return xScale(d.x); })
                .y(function(d){ return yScale2(d.delta); }),
                /*.y0(yScale2(0))
                .y1(function(d){ return yScale2(d.delta); }),*/

            lineGamma = d3.svg.line()
                .x(function(d){ return xScale(d.x); })
                .y(function(d){ return yScale3(d.gamma); }),

            lineVega = d3.svg.line()
                .x(function(d){ return xScale(d.x); })
                .y(function(d){ return yScale4(d.vega); }),

            lineRho = d3.svg.line()
                .x(function(d){ return xScale(d.x); })
                .y(function(d){ return yScale5(d.rho); });

        d3.selectAll('path.blueline').remove();
        d3.selectAll('path.bluearea').remove();

        if($('#btnCall').hasClass('on')){
            svg.append('path')
                .datum(callLineData)
                .attr('class', 'blueline')
                .attr('d', linePremium)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 3);

            svg.append('path')
                .datum(callLineData)
                .attr('class', 'blueline')
                .attr('d', lineDelta)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 3);

            svg.append('path')
                .datum(callLineData)
                .attr('class', 'blueline')
                .attr('d', lineRho)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 3);

        }   else{
            svg.append('path')
                .datum(pullLineData)
                .attr('class', 'blueline')
                .attr('d', linePremium)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 3);

            svg.append('path')
                .datum(pullLineData)
                .attr('class', 'blueline')
                .attr('d', lineDelta)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 3);

            svg.append('path')
                .datum(pullLineData)
                .attr('class', 'blueline')
                .attr('d', lineRho)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 3);
        }

        svg.append('path')
            .datum(callLineData)
            .attr('class', 'blueline')
            .attr('d', lineGamma)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 3);

        svg.append('path')
            .datum(callLineData)
            .attr('class', 'blueline')
            .attr('d', lineVega)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 3);

    }

    function plotExtra(){

        svg.selectAll('circle').remove();
        svg.selectAll('line').remove();

        var Stock = $('#sliderStock').slider('value');
        var Strike = $('#sliderStrike').slider('value');

        if ($('#displaySpot')[0].checked === true){

            svg.append('circle')
                .attr('class', 'circleRed')
                .attr('r', 4)
                .attr('cx', xScale(Stock))
                .attr('cy', yScale3(spotGamma));

            svg.append('circle')
                .attr('class', 'circleRed')
                .attr('r', 4)
                .attr('cx', xScale(Stock))
                .attr('cy', yScale4(spotVega));

            if($('#btnCall').hasClass('on')){

                svg.append('circle')
                    .attr('class', 'circleRed')
                    .attr('r', 4)
                    .attr('cx', xScale(Stock))
                    .attr('cy', yScale1(callPremium));

                svg.append('circle')
                    .attr('class', 'circleRed')
                    .attr('r', 4)
                    .attr('cx', xScale(Stock))
                    .attr('cy', yScale2(callDelta));

                svg.append('circle')
                    .attr('class', 'circleRed')
                    .attr('r', 4)
                    .attr('cx', xScale(Stock))
                    .attr('cy', yScale5(callRho));

                svg.append('line')
                    .attr('class','lineRed')
                    .attr('x1', xScale(Stock - 40))
                    .attr('y1', yScale1(callDelta * (- 40) + callPremium))
                    .attr('x2', xScale(Stock + 40))
                    .attr('y2', yScale1(callDelta * (40) + callPremium));

            }   else{

                svg.append('circle')
                    .attr('class', 'circleRed')
                    .attr('r', 4)
                    .attr('cx', xScale(Stock))
                    .attr('cy', yScale1(putPremium));

                svg.append('circle')
                    .attr('class', 'circleRed')
                    .attr('r', 4)
                    .attr('cx', xScale(Stock))
                    .attr('cy', yScale2(putDelta));

                svg.append('circle')
                    .attr('class', 'circleRed')
                    .attr('r', 4)
                    .attr('cx', xScale(Stock))
                    .attr('cy', yScale5(putRho));

                svg.append('line')
                    .attr('class','lineRed')
                    .attr('x1', xScale(Stock - 40))
                    .attr('y1', yScale1(putDelta * (- 40) + putPremium))
                    .attr('x2', xScale(Stock + 40))
                    .attr('y2', yScale1(putDelta * (40) + putPremium));
            }

        }

        if ($('#displayStrike')[0].checked === true){

                svg.append('line')
                    .attr('class', 'lineStrike')
                    .attr('x1', xScale(Strike))
                    .attr('y1', 40)
                    .attr('x2', xScale(Strike))
                    .attr('y2', 925);
                    //.style('stroke-dasharray', ('5, 5'));

        }

        if ($('#displayForward')[0].checked === true){

            svg.append('line')
                .attr('class', 'lineForward')
                .attr('x1', xScale(spotForward))
                .attr('y1', 40)
                .attr('x2', xScale(spotForward))
                .attr('y2', 925)
                .style('stroke-dasharray', ('5, 5'));
        }

        if($('#btnCall').hasClass('on')){
            svg.append('line')
                .attr('class', 'lineRef')
                .attr('x1', xScale(Strike))
                .attr('y1', yScale1(0))
                .attr('x2', xScale(Strike * 2))
                .attr('y2', yScale1(Strike));
        }   else{
            svg.append('line')
                .attr('class', 'lineRef')
                .attr('x1', xScale(Strike))
                .attr('y1', yScale1(0))
                .attr('x2', xScale(0))
                .attr('y2', yScale1(Strike));
        }


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

        spotGamma = Gamma(Stock, Strike, Mat, Q, R, Vol);

        spotVega = Vega(Stock, Strike, Mat, Q, R, Vol);

        callPremium = BlackScholes('c', Stock, Strike, Mat, Q, R, Vol);

        putPremium = BlackScholes('p', Stock, Strike, Mat, Q, R, Vol);

        callDelta = Delta('c', Stock, Strike, Mat, Q, R, Vol);

        putDelta = Delta('p', Stock, Strike, Mat, Q, R, Vol);

        callRho = Rho('c', Stock, Strike, Mat, Q, R, Vol);

        putRho = Rho('p', Stock, Strike, Mat, Q, R, Vol);

        /*$('#Stock span').html(Stock);
        $('#Strike span').html(Strike);
        $('#Risk span').html((1000 * R / 10).toPrecision(2));
        $('#Dividend span').html((1000 * Q / 10).toPrecision(2));
        $('#Maturity span').html(Mat);
        $('#Volatility span').html(1000 * Vol / 10);*/

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
        yScale3.domain([0.06, 0]);
        yScale4.domain([130, 0]);

        if($('#btnCall').hasClass('on')){
            yScale2.domain([1, 0]);
            yScale5.domain([400, 0]);
        }   else{
            yScale2.domain([-1, 0]);
            yScale5.domain([-400, 0]);
        }

        callCurve(Strike, Mat, Q, R, Vol);
        putCurve(Strike, Mat, Q, R, Vol);

        plotAxes();

        plotGraphs();

        plotExtra();
    }

    function audio() {

        $('audio[controls]').before(function(){
            var song = this;
            song.controls=false;
            var player_box = document.createElement('div');
            $(player_box).addClass($(song).attr('class') + 'well well-sm playa');
            var data_sec = document.createElement('section');
            $(data_sec).addClass('collapse');
            //var toggle_holder = document.createElement('div');
            //$(toggle_holder).addClass('btn-group row-fluid');
            var data_toggle = document.createElement('a');
            //$(data_toggle).html('<i class="icon-recorder"></i>');
            $(data_toggle).addClass('btn btn-block');
            $(data_toggle).attr('style', 'opacity:1.0');
            $(data_toggle).click(function (){$(data_sec).collapse('toggle');});
            $(data_toggle).attr('title', 'Details');
            //$(data_toggle).tooltip({'container': 'body', 'placement': 'top', 'html': true});
            //$(toggle_holder).append(data_toggle);
            var data_table = document.createElement('table');
            $(data_table).addClass('table table-condensed');
            var player = document.createElement('section');
            $(player).addClass('btn-group row-fluid');
            var load_error = function(){
                window.console.log('error');
                $(player_box).find('.btn').addClass('disabled');
                $(player_box).find('input[type="range"]').hide();
                $(player_box).find('.icon-spin').text('Error');
                $(player_box).find('.icon-spin').parent().attr('title', 'There was an error loading the audio.');
                $(player_box).find('.icon-spin').parent().tooltip('fixTitle');
                $(player_box).find('.icon-spin').removeClass('icon-spinner icon-spin');
            };
            var addPlay = function() {
                var play = document.createElement('button');
                $(play).addClass('btn disabled span1');
                play.setPlayState = function(toggle){
                    $(play).removeClass('disabled');
                    if (toggle === 'play') {
                        $(play).html('<i class="glyphicon glyphicon-play"></i>');
                        $(play).click(function () {
                            song.play();
                        });
                    }
                    if (toggle === 'pause') {
                        $(play).html('<i class="glyphicon glyphicon-pause"></i>');
                        $(play).click(function () {
                            song.pause();
                        });
                    }
                };
                $(song).on('play', function(){play.setPlayState('pause');});
                $(song).on('canplay', function(){play.setPlayState('play');});
                $(song).on('pause', function(){play.setPlayState('play');});
                var timeout = 0;
                var loadCheck = setInterval(function() {
                    if(isNaN(song.duration) === false){
                        play.setPlayState('play');
                        clearInterval(loadCheck);
                        return true;
                    }
                    if(song.networkState === 3 || timeout === 75){
                        load_error();
                        clearInterval(loadCheck);
                        return false;
                    }
                    timeout++;
                }, 50);

                $(player).append(play);
            };
            var addSeek = function() {
                var seek = document.createElement('input');
                $(seek).attr({
                    'type': 'range',
                    'min': 0,
                    'value': 0,
                    'class': 'seek'
                });
                seek.progress = function () {
                    var bg = 'rgba(223, 240, 216, 1) 0%';
                    bg += ', rgba(223, 240, 216, 1) ' + ((song.currentTime/song.duration) * 100) + '%';
                    bg += ', rgba(223, 240, 216, 0) ' + ((song.currentTime/song.duration) * 100) + '%';
                    for (var i=0; i<song.buffered.length; i++){
                        if (song.buffered.end(i) > song.currentTime && isNaN(song.buffered.end(i)) === false && isNaN(song.buffered.start(i)) === false){
                            var bufferedstart;
                            var bufferedend;
                            if (song.buffered.end(i) < song.duration) {
                                bufferedend = ((song.buffered.end(i)/song.duration) * 100);
                            }
                            else {
                                bufferedend = 100;
                            }
                            if (song.buffered.start(i) > song.currentTime){
                                bufferedstart = ((song.buffered.start(i)/song.duration) * 100);
                            }
                            else {
                                bufferedstart = ((song.currentTime/song.duration) * 100);
                            }
                            bg += ', rgba(217, 237, 247, 0) ' + bufferedstart + '%';
                            bg += ', rgba(217, 237, 247, 1) ' + bufferedstart + '%';
                            bg += ', rgba(217, 237, 247, 1) ' + bufferedend + '%';
                            bg += ', rgba(217, 237, 247, 0) ' + bufferedend + '%';
                        }
                    }
                    $(seek).css('background', '-webkit-linear-gradient(left, ' + bg + ')');
                    //These may be re-enabled when/if other browsers support the background like webkit
                    //$(seek).css('background','-o-linear-gradient(left,  ' + bg + ')');
                    //$(seek).css('background','-moz-linear-gradient(left,  ' + bg + ')');
                    //$(seek).css('background','-ms-linear-gradient(left,  ' + bg + ')');
                    //$(seek).css('background','linear-gradient(to right,  ' + bg + ')');
                    $(seek).css('background-color', '#ddd');
                };
                seek.set = function () {
                    $(seek).val(song.currentTime);
                    seek.progress();
                };
                seek.slide = function () {
                    song.currentTime = $(seek).val();
                    seek.progress();
                };
                seek.init = function () {
                    $(seek).attr({
                        'max': song.duration,
                        'step': song.duration / 100
                    });
                    seek.set();
                };
                seek.reset = function () {
                    $(seek).val(0);
                    song.currentTime = $(seek).val();
                    if(!song.loop){song.pause();}
                    else {song.play();}
                };
                var seek_wrapper = document.createElement('div');
                $(seek_wrapper).addClass('btn disabled span4');

                $(seek_wrapper).append(seek);
                $(seek).on('change', seek.slide);
                $(song).on('timeupdate', seek.init);
                $(song).on('loadedmetadata', seek.init);
                $(song).on('loadeddata', seek.init);
                $(song).on('progress', seek.init);
                $(song).on('canplay', seek.init);
                $(song).on('canplaythrough', seek.init);
                $(song).on('ended', seek.reset);
                if(song.readyState > 0){
                    seek.init();
                }
                $(player).append(seek_wrapper);
            };
            var addTime = function() {
                var time = document.createElement('a');
                $(time).addClass('btn span3');
                $(time).tooltip({'container': 'body', 'placement': 'right', 'html': true});
                time.twodigit = function (myNum) {
                    return ("0" + myNum).slice(-2);
                };
                time.timesplit = function (a) {
                    if (isNaN(a)){return '<i class="icon-spinner icon-spin"></i>';}
                    var hours = Math.floor(a / 3600);
                    var minutes = Math.floor(a / 60) - (hours * 60);
                    var seconds = Math.floor(a) - (hours * 3600) - (minutes * 60);
                    var timeStr = time.twodigit(minutes) + ':' + time.twodigit(seconds);
                    if (hours > 0) {
                        timeStr = hours + ':' + timeStr;
                    }
                    return timeStr;
                };
                time.showtime = function () {
                    $(time).html(time.timesplit(song.duration));
                    $(time).attr({'title': 'Click to Reset<hr style="padding:0; margin:0;" />Position: ' + (time.timesplit(song.currentTime))});
                    if (!song.paused){
                        $(time).html(time.timesplit(song.currentTime));
                        $(time).attr({'title': 'Click to Reset<hr style="padding:0; margin:0;" />Length: ' + (time.timesplit(song.duration))});
                    }
                    $(time).tooltip('fixTitle');
                };
                $(time).click(function () {
                    song.pause();
                    song.currentTime = 0;
                    time.showtime();
                    $(time).tooltip('fixTitle');
                    $(time).tooltip('show');
                });
                $(time).tooltip('show');
                $(song).on('loadedmetadata', time.showtime);
                $(song).on('loadeddata', time.showtime);
                $(song).on('progress', time.showtime);
                $(song).on('canplay', time.showtime);
                $(song).on('canplaythrough', time.showtime);
                $(song).on('timeupdate', time.showtime);
                if(song.readyState > 0){
                    time.showtime();
                }
                else {
                    $(time).html('<i class="icon-spinner icon-spin"></i>');
                }
                $(player).append(time);
            };
            /*var addMute = function() {
             var mute = document.createElement('button');
             $(mute).addClass('btn span1');
             mute.checkVolume = function () {
             if (song.volume > 0.5 && !song.muted) {
             $(mute).html('<i class="glyphicon glyphicon-volume-up"></i>');
             } else if (song.volume < 0.5 && song.volume > 0 && !song.muted) {
             $(mute).html('<i class="glyphicon glyphicon-volume-down"></i>');
             } else {
             $(mute).html('<i class="glyphicon glyphicon-volume-off"></i>');
             }
             };
             $(mute).click(function () {
             if (song.muted) {
             song.muted = false;
             song.volume = song.oldvolume;
             } else {
             song.muted = true;
             song.oldvolume = song.volume;
             song.volume = 0;
             }
             mute.checkVolume();
             });
             mute.checkVolume();
             $(song).on('volumechange', mute.checkVolume);
             $(player).append(mute);
             };
             /*var addVolume = function() {
             var volume = document.createElement('input');
             $(volume).attr({
             'type': 'range',
             'min': 0,
             'max': 1,
             'step': 1 / 100,
             'value': 1
             });
             volume.slide = function () {
             song.muted = false;
             song.volume = $(volume).val();
             };
             volume.set = function () {
             $(volume).val(song.volume);
             };
             var vol_wrapper = document.createElement('div');
             $(vol_wrapper).addClass('btn disabled span3');
             $(vol_wrapper).append(volume);
             $(volume).on("change", volume.slide);
             $(song).on('volumechange', volume.set);
             $(player).append(vol_wrapper);
             };
             var addAlbumArt = function() {
             var albumArt = document.createElement('img');
             $(albumArt).addClass('thumbnail');
             $(albumArt).attr('src', $(song).data('infoAlbumArt'));
             $(data_sec).append(albumArt);
             };
             var addInfo = function(title, dataId) {
             var row = document.createElement('tr');
             var head = document.createElement('th');
             var data = document.createElement('td');
             $(head).html(title);
             $(data).html($(song).data(dataId));
             $(row).append(head);
             $(row).append(data);
             $(data_table).append(row);
             };
             /*var addData = function() {
             if (typeof($(song).data('infoAlbumArt')) !== 'undefined'){ addAlbumArt();}
             if (typeof($(song).data('infoArtist')) !== 'undefined'){ addInfo('Artist', 'infoArtist');}
             if (typeof($(song).data('infoTitle')) !== 'undefined'){ addInfo('Title', 'infoTitle');}
             if (typeof($(song).data('infoAlbumTitle')) !== 'undefined'){ addInfo('Album', 'infoAlbumTitle');}
             if (typeof($(song).data('infoLabel')) !== 'undefined'){ addInfo('Label', 'infoLabel');}
             if (typeof($(song).data('infoYear')) !== 'undefined'){ addInfo('Year', 'infoYear');}
             if ($(data_table).html() !== ""){
             $(data_sec).append(data_table);
             $(player_box).append(toggle_holder);
             $(player_box).append(data_sec);
             }
             };*/
            var addPlayer = function() {
                if ($(song).data('play') !== 'off'){ addPlay();}
                if ($(song).data('seek') !== 'off'){ addSeek();}
                if ($(song).data('time') !== 'off'){ addTime();}
                //if ($(song).data('mute') !== 'off'){ addMute();}
                //if ($(song).data('volume') !== 'off'){ addVolume();}
                $(player_box).append(player);
            };
            var addAttribution = function() {
                var attribution = document.createElement('small');
                $(attribution).addClass('pull-right muted');
                if (typeof($(song).data('infoAttLink')) !== 'undefined'){
                    var attribution_link = document.createElement('a');
                    $(attribution_link).addClass('muted');
                    $(attribution_link).attr('href', $(song).data('infoAttLink'));
                    $(attribution_link).html($(song).data('infoAtt'));
                    $(attribution).append(attribution_link);
                }
                else {
                    $(attribution).html($(song).data('infoAtt'));
                }
                $(player_box).append(attribution);
            };
            var fillPlayerBox = function() {
                //addData();
                addPlayer();
                if (typeof($(song).data('infoAtt')) !== 'undefined'){ addAttribution();}
            };
            fillPlayerBox();
            $(song).on('error', function(){
                load_error();
            });
            return player_box;
        });

    }

    function reset() {
        $('#sliderStock').slider('value', 100 );
        $('#sliderStrike').slider('value', 100 );
        $('#sliderRisk').slider('value', 0.0 );
        $('#sliderDividend').slider('value', 0.0 );
        $('#sliderMaturity').slider('value', 2.5 );
        $('#sliderVolatility').slider('value', 0.4 );

        $('#Stock span').html(100);
        $('#Strike span').html(100);
        $('#Risk span').html(0.0);
        $('#Dividend span').html(0.0);
        $('#Maturity span').html(2.5);
        $('#Volatility span').html(40);
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
                var n = Math.round(ui.value * 10000) / 100;
                if(n >= 0 && (n + '').length === 1){n+='.0';}
                if(n < 0 && (n + '').length === 2){n+='.0';}
                $('#Risk span').html(n);
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
                var n = Math.round(ui.value * 10000) / 100;
                if(n >= 0 && (n + '').length === 1){n+='.0';}
                if(n < 0 && (n + '').length === 2){n+='.0';}
                $('#Dividend span').html(n);
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
                var n = ui.value;
                if((n + '').length === 1){n+='.0';}
                $('#Maturity span').html(n);
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

        $('#displaySpot').val($(this).is(':checked'))
            .change(function(){plotExtra();});

        $('#displayForward').val($(this).is(':checked'))
                .change(function(){plotExtra();});

        $('#displayStrike').val($(this).is(':checked'))
            .change(function(){plotExtra();});

        $('#audioForward').click(function(){
            $('#audioForward').hide('slideLeft');
            $('#playerForward').delay(600).show('slideUp');
        });

        $('#audioVolatility').click(function(){
            $('#audioVolatility').hide('slideLeft');
            $('#playerVolatility').delay(600).show('slideUp');
        });

        $('#audioRates').click(function(){
            $('#audioRates').hide('slideLeft');
            $('#playerRates').delay(600).show('slideUp');
        });

        $('#audioTime').click(function(){
            $('#audioTime').hide('slideLeft');
            $('#playerTime').delay(600).show('slideUp');
        });

        $('#btnReset').click(function(){
            reset();
        });

        $('.carousel').carousel({
            interval: 6000,
            pause: 'hover'
        });

        $('#btnCall').click(function(){
            $('#btnPut').removeClass('on').addClass('off');
            $('#btnCall').switchClass('off','on');
            $('#divGraphs h3 span').html('(Call)');
            update();
        });

        $('#btnPut').click(function(){
            $('#btnCall').removeClass('on').addClass('off');
            $('#btnPut').switchClass('off','on');
            $('#divGraphs h3 span').html('(Put)');
            update();
        });

        plotTitles();

        audio();
  });

}(window.jQuery, window.d3));