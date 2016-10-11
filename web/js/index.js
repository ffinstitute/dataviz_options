/**
 * Created by Jean on 13/07/15.
 */

/* jshint browser: true, jquery: true */

;(function ($, d3) {

    'use strict';

    /**
     * @return {number}
     */
    function CND(x) {

        var a1, a2, a3, a4, a5, k;

        a1 = 0.31938153;
        a2 = -0.356563782;
        a3 = 1.781477937;
        a4 = -1.821255978;
        a5 = 1.330274429;

        if (x < 0.0) {
            return 1 - CND(-x);
        }
        else {
            k = 1.0 / (1.0 + 0.2316419 * x);
            return 1.0 - Math.exp(-x * x / 2.0) / Math.sqrt(2 * Math.PI) * k * (a1 + k * (a2 + k * (a3 + k * (a4 + k * a5))));
        }
    }

    /**
     * @return {number}
     */
    function SND(x) {

        return Math.exp(-x * x / 2.0) / Math.sqrt(2 * Math.PI);
    }

    /**
     * @return {number}
     */
    function BlackScholes(PutCallFlag, S, K, T, q, r, v) {

        var d1, d2;

        d1 = (Math.log(S / K) + (r - q + v * v / 2.0) * T) / (v * Math.sqrt(T));
        d2 = d1 - v * Math.sqrt(T);

        if (PutCallFlag === 'c') {
            return Math.exp(-q * T) * S * CND(d1) - Math.exp(-r * T) * K * CND(d2);
        }
        else {
            return Math.exp(-r * T) * K * CND(-d2) - Math.exp(-q * T) * S * CND(-d1);
        }
    }

    /**
     * @return {number}
     */
    function Forward(S, T, q, r) {
        return S * Math.exp((r - q) * T);
    }

    /**
     * @return {number}
     */
    function Delta(PutCallFlag, S, K, T, q, r, v) {

        var d1;

        d1 = (Math.log(S / K) + (r - q + v * v / 2.0) * T) / (v * Math.sqrt(T));

        if (PutCallFlag === 'c') {
            return Math.exp(-q * T) * CND(d1);
        }
        else {
            return -Math.exp(-q * T) * CND(-d1);
        }
    }

    /**
     * @return {number}
     */
    function Gamma(S, K, T, q, r, v) {

        var d1, d2;

        d1 = (Math.log(S / K) + (r - q + v * v / 2.0) * T) / (v * Math.sqrt(T));
        //d2 = d1 - v * Math.sqrt(T);

        return Math.exp(-r * T) * SND(d1) / (S * v * Math.sqrt(T));

    }

    /**
     * @return {number}
     */
    function Vega(S, K, T, q, r, v) {

        var d1;

        d1 = (Math.log(S / K) + (r - q + v * v / 2.0) * T) / (v * Math.sqrt(T));

        return S * Math.exp(-q * T) * SND(d1) * Math.sqrt(T);
        // Or return K * Math.exp(-r * T) * SND(d2) * Math.sqrt(T);

    }

    /**
     * @return {number}
     */
    function Theta(PutCallFlag, S, K, T, q, r, v) {
        var d1, d2;

        d1 = (Math.log(S / K) + (r - q + v * v / 2.0) * T) / (v * Math.sqrt(T));
        d2 = d1 - v * Math.sqrt(T);

        if (PutCallFlag === 'c') {
            return -Math.exp(-q * T) * S * SND(d1) * v / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * CND(d2) + q * S * Math.exp(-q * T) * CND(d1);
        }
        else {
            return -Math.exp(-q * T) * S * SND(d1) * v / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * CND(-d2) - q * S * Math.exp(-q * T) * CND(-d1);
        }
    }

    /**
     * @return {number}
     */
    function Rho(PutCallFlag, S, K, T, q, r, v) {

        var d1, d2;

        d1 = (Math.log(S / K) + (r - q + v * v / 2.0) * T) / (v * Math.sqrt(T));
        d2 = d1 - v * Math.sqrt(T);

        if (PutCallFlag === 'c') {
            return K * T * Math.exp(-r * T) * CND(d2);
        }
        else {
            return -K * T * Math.exp(-r * T) * CND(-d2);
        }

    }


    var width = $('#divGraphs').width(),
        height = 1130;

    var svg = d3.select('#allGraphs')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    var rightMargin = 15;
    var xScale = d3.scale.linear().range([50, width - rightMargin]);

    var yScale1 = d3.scale.linear().range([20, 200]),
        yScale3 = d3.scale.linear().range([440, 560]),
        yScale4 = d3.scale.linear().range([620, 740]),
        yScale5 = d3.scale.linear().range([810, 930]),
        yScale6 = d3.scale.linear().range([980, 1100]);

    var yScale2;

    function updateSize() {
        width = $('#divGraphs').width();

        svg.attr('width', width);

        xScale = d3.scale.linear().range([50, width - rightMargin]);
        update();
    }

    function plotTitles() {

        svg.selectAll('text').remove();

        svg.append('text')
            .text('Pay-out and Option Value')
            .attr('x', width / 4)
            .attr('y', 30)
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .attr('fill', 'gray');

        if ($('#divPrices').hasClass('call')) {

            svg.append('text')
                .text('Delta')
                .attr('x', width / 4)
                .attr('y', 270)
                .attr('font-size', 14)
                .attr('font-weight', 'bold')
                .attr('fill', 'gray');

            svg.append('text')
                .text('Rho')
                .attr('x', width / 4)
                .attr('y', 990)
                .attr('font-size', 14)
                .attr('font-weight', 'bold')
                .attr('fill', 'gray');

        } else if ($('#divPrices').hasClass('put')) {
            svg.append('text')
                .text('Delta')
                .attr('x', 3 * width / 4)
                .attr('y', 380)
                .attr('font-size', 14)
                .attr('font-weight', 'bold')
                .attr('fill', 'gray');

            svg.append('text')
                .text('Rho')
                .attr('x', 3 * width / 4)
                .attr('y', 1100)
                .attr('font-size', 14)
                .attr('font-weight', 'bold')
                .attr('fill', 'gray');
        }

        svg.append('text')
            .text('Gamma')
            .attr('x', 3 * width / 4)
            .attr('y', 450)
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .attr('fill', 'gray');

        svg.append('text')
            .text('Vega')
            .attr('x', width / 4)
            .attr('y', 630)
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .attr('fill', 'gray');

        svg.append('text')
            .text('Theta')
            .attr('x', width / 4)
            .attr('y', 930)
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .attr('fill', 'gray');

    }

    var callLineData = [];

    function callCurve(K, T, q, r, v) {

        callLineData = [];

        for (var i = 0; i < width; i += 2) {

            var x = i * 2 * K / width;

            var y, delta, gamma, vega, theta, rho;

            if (isNaN(BlackScholes('c', x, K, T, q, r, v))) {
                y = 0;
            } else {
                y = BlackScholes('c', x, K, T, q, r, v);
            }

            if (isNaN(Delta('c', x, K, T, q, r, v))) {
                delta = 0;
            } else {
                delta = Delta('c', x, K, T, q, r, v);
            }

            if (isNaN(Gamma(x, K, T, q, r, v))) {
                gamma = 0;
            } else {
                gamma = Gamma(x, K, T, q, r, v);
            }

            if (isNaN(Vega(x, K, T, q, r, v))) {
                vega = 0;
            } else {
                vega = Vega(x, K, T, q, r, v);
            }

            if (isNaN(Theta('c', x, K, T, q, r, v))) {
                theta = 0;
            } else {
                theta = Theta('c', x, K, T, q, r, v);
            }

            if (isNaN(Rho('c', x, K, T, q, r, v))) {
                rho = 0;
            } else {
                rho = Rho('c', x, K, T, q, r, v);
            }

            var data = {'x': x, 'y': y, 'delta': delta, 'gamma': gamma, 'vega': vega, 'theta': theta, 'rho': rho};
            callLineData.push(data);

        }

        return callLineData;

    }

    var putLineData = [];

    function putCurve(K, T, q, r, v) {

        putLineData = [];

        for (var i = 0; i < width; i += 2) {

            var x = i * 2 * K / width;

            var y, delta, gamma, vega, theta, rho;

            if (isNaN(BlackScholes('p', x, K, T, q, r, v))) {
                y = 0;
            } else {
                y = BlackScholes('p', x, K, T, q, r, v);
            }

            if (isNaN(Delta('p', x, K, T, q, r, v))) {
                delta = 0;
            } else {
                delta = Delta('p', x, K, T, q, r, v);
            }

            if (isNaN(Gamma(x, K, T, q, r, v))) {
                gamma = 0;
            } else {
                gamma = Gamma(x, K, T, q, r, v);
            }

            if (isNaN(Vega(x, K, T, q, r, v))) {
                vega = 0;
            } else {
                vega = Vega(x, K, T, q, r, v);
            }

            if (isNaN(Theta('p', x, K, T, q, r, v))) {
                theta = 0;
            } else {
                theta = Theta('p', x, K, T, q, r, v);
            }

            if (isNaN(Rho('p', x, K, T, q, r, v))) {
                rho = 0;
            } else {
                rho = Rho('p', x, K, T, q, r, v);
            }

            var data2 = {'x': x, 'y': y, 'delta': delta, 'gamma': gamma, 'vega': vega, 'theta': theta, 'rho': rho};
            putLineData.push(data2);

        }

        return putLineData;
    }

    function plotAxes() {

        svg.selectAll('g').remove();

        var xAxis1 = d3.svg.axis()
                .ticks(10)
                .scale(xScale),
            leftMargin = 40;

        if ($('#divPrices').hasClass('call')) {
            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + 200 + ')')
                .call(xAxis1.orient('bottom'));

            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + 380 + ')')
                .call(xAxis1.orient('bottom'));

            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + 560 + ')')
                .call(xAxis1.orient('bottom'));

            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + 740 + ')')
                .call(xAxis1.orient('bottom'));

            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + 810 + ')')
                .call(xAxis1.orient('top'));

            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + 1100 + ')')
                .call(xAxis1.orient('bottom'));
        } else if ($('#divPrices').hasClass('put')) {
            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + 200 + ')')
                .call(xAxis1.orient('bottom'));

            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + 270 + ')')
                .call(xAxis1.orient('top'));

            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + 560 + ')')
                .call(xAxis1.orient('bottom'));

            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + 740 + ')')
                .call(xAxis1.orient('bottom'));

            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + 810 + ')')
                .call(xAxis1.orient('top'));

            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + 980 + ')')
                .call(xAxis1.orient('top'));
        }


        var yAxis1 = d3.svg.axis()
            .ticks(5)
            //.tickSize(80-width)
            //.tickFormat(d3.format('s'))
            .scale(yScale1)
            .orient('left');

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + leftMargin + ', ' + 0 + ')')
            .call(yAxis1);

        var yAxis2 = d3.svg.axis()
            .ticks(5)
            .scale(yScale2)
            .orient('left');

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + leftMargin + ', ' + 0 + ')')
            .call(yAxis2);

        var yAxis3 = d3.svg.axis()
            .ticks(5)
            .scale(yScale3)
            .orient('left');

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + leftMargin + ', ' + 0 + ')')
            .call(yAxis3);

        var yAxis4 = d3.svg.axis()
            .ticks(5)
            .scale(yScale4)
            .orient('left');

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + leftMargin + ', ' + 0 + ')')
            .call(yAxis4);

        var yAxis5 = d3.svg.axis()
            .ticks(5)
            .scale(yScale5)
            .orient('left');

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + leftMargin + ', ' + 0 + ')')
            .call(yAxis5);

        var yAxis6 = d3.svg.axis()
            .ticks(5)
            .scale(yScale6)
            .orient('left');

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + leftMargin + ', ' + 0 + ')')
            .call(yAxis6);

        svg.selectAll('.axis line, .axis path')
            .style({'fill': 'none', 'stroke-width': '2', 'stroke': 'darkgray', 'shape-rendering': 'crispEdges'});
    }

    function plotGraphs() {

        var linePremium = d3.svg.line()
                .x(function (d) {
                    return xScale(d.x);
                })
                .y(function (d) {
                    return yScale1(d.y);
                }),

            lineDelta = d3.svg.line()
                .x(function (d) {
                    return xScale(d.x);
                })
                .y(function (d) {
                    return yScale2(d.delta);
                }),

            lineGamma = d3.svg.line()
                .x(function (d) {
                    return xScale(d.x);
                })
                .y(function (d) {
                    return yScale3(d.gamma);
                }),

            lineVega = d3.svg.line()
                .x(function (d) {
                    return xScale(d.x);
                })
                .y(function (d) {
                    return yScale4(d.vega);
                }),

            lineTheta = d3.svg.line()
                .x(function (d) {
                    return xScale(d.x);
                })
                .y(function (d) {
                    return yScale5(d.theta);
                }),

            lineRho = d3.svg.line()
                .x(function (d) {
                    return xScale(d.x);
                })
                .y(function (d) {
                    return yScale6(d.rho);
                });

        d3.selectAll('path.blueline').remove();
        d3.selectAll('path.bluearea').remove();

        if ($('#divPrices').hasClass('call')) {

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
                .attr('d', lineTheta)
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

        } else if ($('#divPrices').hasClass('put')) {
            svg.append('path')
                .datum(putLineData)
                .attr('class', 'blueline')
                .attr('d', linePremium)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 3);

            svg.append('path')
                .datum(putLineData)
                .attr('class', 'blueline')
                .attr('d', lineDelta)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 3);

            svg.append('path')
                .datum(putLineData)
                .attr('class', 'blueline')
                .attr('d', lineTheta)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 3);

            svg.append('path')
                .datum(putLineData)
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

    function plotExtra() {

        svg.selectAll('circle').remove();
        svg.selectAll('line').remove();

        var Stock = parseInt($('#sliderStock').val()),
            Strike = parseInt($('#sliderStrike').val());


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

        if ($('#divPrices').hasClass('call')) {

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
                .attr('cy', yScale5(callTheta));

            svg.append('circle')
                .attr('class', 'circleRed')
                .attr('r', 4)
                .attr('cx', xScale(Stock))
                .attr('cy', yScale6(callRho));

            svg.append('line')
                .attr('class', 'lineRed')
                .attr('x1', xScale(Stock - 40))
                .attr('y1', yScale1(callDelta * (-40) + callPremium))
                .attr('x2', xScale(Stock + 40))
                .attr('y2', yScale1(callDelta * (40) + callPremium));

        } else if ($('#divPrices').hasClass('put')) {

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
                .attr('cy', yScale5(putTheta));

            svg.append('circle')
                .attr('class', 'circleRed')
                .attr('r', 4)
                .attr('cx', xScale(Stock))
                .attr('cy', yScale6(putRho));

            svg.append('line')
                .attr('class', 'lineRed')
                .attr('x1', xScale(Stock - 40))
                .attr('y1', yScale1(putDelta * (-40) + putPremium))
                .attr('x2', xScale(Stock + 40))
                .attr('y2', yScale1(putDelta * (40) + putPremium));
        }

        svg.append('line')
            .attr('class', 'lineStrike')
            .attr('x1', xScale(Strike))
            .attr('y1', 40)
            .attr('x2', xScale(Strike))
            .attr('y2', 1105);

        svg.append('line')
            .attr('class', 'lineForward')
            .attr('x1', xScale(spotForward))
            .attr('y1', 40)
            .attr('x2', xScale(spotForward))
            .attr('y2', 1105)
            .style('stroke-dasharray', ('5, 5'));

        if ($('#divPrices').hasClass('call')) {
            svg.append('line')
                .attr('class', 'lineRef')
                .attr('x1', xScale(Strike))
                .attr('y1', yScale1(0))
                .attr('x2', xScale(Strike * 2))
                .attr('y2', yScale1(Strike));
        } else if ($('#divPrices').hasClass('put')) {
            svg.append('line')
                .attr('class', 'lineRef')
                .attr('x1', xScale(Strike))
                .attr('y1', yScale1(0))
                .attr('x2', xScale(0))
                .attr('y2', yScale1(Strike));
        }
    }

    var spotForward, callPremium, putPremium, callDelta, putDelta, spotGamma, spotVega, callTheta, putTheta, callRho, putRho;

    function update() {
        var Stock = parseInt($('#sliderStock').val()),
            Strike = parseInt($('#sliderStrike').val()),
            Mat = parseFloat($('#sliderMaturity').val()),
            R = parseFloat($('#sliderRisk').val()),
            Q = parseFloat($('#sliderDividend').val()),
            Vol = parseFloat($('#sliderVolatility').val());

        var Drift = Q - R;
        spotForward = Forward(Stock, Mat, Q, R);
        callPremium = BlackScholes('c', Stock, Strike, Mat, Q, R, Vol);
        putPremium = BlackScholes('p', Stock, Strike, Mat, Q, R, Vol);
        callDelta = Delta('c', Stock, Strike, Mat, Q, R, Vol);
        putDelta = Delta('p', Stock, Strike, Mat, Q, R, Vol);
        spotGamma = Gamma(Stock, Strike, Mat, Q, R, Vol);
        spotVega = Vega(Stock, Strike, Mat, Q, R, Vol);
        callTheta = Theta('c', Stock, Strike, Mat, Q, R, Vol);
        putTheta = Theta('p', Stock, Strike, Mat, Q, R, Vol);
        callRho = Rho('c', Stock, Strike, Mat, Q, R, Vol);
        putRho = Rho('p', Stock, Strike, Mat, Q, R, Vol);

        $('#Drift').find('span').html(Math.round(10000 * Drift) / 100);
        $('#Forward').find('span').html(Math.round(100 * spotForward) / 100);

        $('.Gamma span').html(Math.round(10000 * spotGamma) / 10000);
        $('.Vega span').html(Math.round(100 * spotVega) / 100);

        $('#callPremium').find('span').html(Math.round(callPremium * 100) / 100);
        $('#callPremiumPct').find('span').html(Math.round(callPremium / Stock * 10000) / 100);
        $('#callDelta').find('span').html(Math.round(callDelta * 10000) / 10000);
        $('#callTheta').find('span').html(Math.round(callTheta * 10000) / 10000);
        $('#callRho').find('span').html(Math.round(callRho * 10000) / 10000);

        $('#putPremium').find('span').html(Math.round(putPremium * 100) / 100);
        $('#putPremiumPct').find('span').html(Math.round(putPremium / Stock * 10000) / 100);
        $('#putDelta').find('span').html(Math.round(putDelta * 10000) / 10000);
        $('#putTheta').find('span').html(Math.round(putTheta * 10000) / 10000);
        $('#putRho').find('span').html(Math.round(putRho * 10000) / 10000);

        callCurve(Strike, Mat, Q, R, Vol);
        putCurve(Strike, Mat, Q, R, Vol);

        var ymaxcall = d3.max(callLineData, function (d) {
                return d.y;
            }),
            ymaxput = d3.max(putLineData, function (d) {
                return d.y;
            }),
            Dmaxcall = d3.max(callLineData, function (d) {
                return d.delta;
            }),
            Dminput = d3.min(putLineData, function (d) {
                return d.delta;
            }),
            Gmax = d3.max(callLineData, function (d) {
                return d.gamma;
            }),
            Vmax = d3.max(callLineData, function (d) {
                return d.vega;
            }),
            Tmincall = d3.min(callLineData, function (d) {
                return d.theta;
            }),
            Tmaxcall = d3.max(callLineData, function (d) {
                return d.theta;
            }),
            Tminput = d3.min(putLineData, function (d) {
                return d.theta;
            }),
            Tmaxput = d3.max(putLineData, function (d) {
                return d.theta;
            }),
            Rmaxcall = d3.max(callLineData, function (d) {
                return d.rho;
            }),
            Rminput = d3.min(putLineData, function (d) {
                return d.rho;
            });

        xScale.domain([0, 2 * Strike]);

        yScale3.domain([Gmax, 0]);
        yScale4.domain([Vmax, 0]);

        if ($('#divPrices').hasClass('call')) {
            yScale1.domain([ymaxcall, 0]);
            yScale2 = d3.scale.linear().range([260, 380]);
            yScale2.domain([Dmaxcall, 0]);
            yScale5.domain([Tmaxcall, Tmincall]);
            yScale6.domain([Rmaxcall, 0]);
        } else if ($('#divPrices').hasClass('put')) {
            yScale1.domain([ymaxput, 0]);
            yScale2 = d3.scale.linear().range([270, 390]);
            yScale2.domain([0, Dminput]);
            yScale5.domain([Tmaxput, Tminput]);
            yScale6.domain([0, Rminput]);
        }

        plotTitles();
        plotAxes();
        plotGraphs();
        plotExtra();
    }

    function reset() {

        $('#sliderStock').val(100);
        $('#sliderStrike').val(100);
        $('#sliderRisk').val(0);
        $('#sliderDividend').val(0);
        $('#sliderMaturity').val(2.5);
        $('#sliderVolatility').val(0.4);

        $('#Stock').find('span').html(100);
        $('#Strike').find('span').html(100);
        $('#Risk').find('span').html((0.0).toPrecision(2));
        $('#Dividend').find('span').html((0.0).toPrecision(2));
        $('#Maturity').find('span').html(2.5);
        $('#Volatility').find('span').html(40);
        update();
    }


    //helper function
    function processPercentage(v, name) {
        switch (name) {
            case 'Risk':
            case 'Dividend':
                v = v * 100;

            case 'Maturity':
                return parseFloat(v).toFixed(1);

            case 'Volatility':
                return Math.round(v * 100);

            default:
                return v;
        }
    }

    // Slider inputs
    $(document).ready(function () {

        $('#divParameters').find('.slider').on('input', function () {
            update();
            var name = this.id.replace('slider', '');
            $('#' + name).find('span').text(processPercentage(this.value, name));
        });

        setTimeout(update, 10);

        $('.ui-slider').css('background', '#00297B');

        $('.ui-slider-handle').css('border-color', '#00297B');

        /*$('#displaySpot').change(function () {
         plotExtra();
         });

         $('#displayForward').change(function () {
         plotExtra();
         });

         $('#displayStrike').change(function () {
         plotExtra();
         });*/

        $('#btnReset').click(function () {
            reset();
        });

        $('.carousel').carousel({
            interval: 6000,
            pause: 'hover'
        });

        $('#btnCall, td.call').click(function () {
            $('#divPrices').addClass('call').removeClass('put');
            $('#divGraphs').find('h3 span').html('(Call)');
            update();
        });

        $('#btnPut, td.put').click(function () {
            $('#divPrices').addClass('put').removeClass('call');
            $('#divGraphs').find('h3 span').html('(Put)');
            update();
        });

        plotTitles();

        d3.select(window).on('resize', function () {
            updateSize();
        });

    });

}(window.jQuery, window.d3));