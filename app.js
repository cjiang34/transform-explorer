

function init(){

//Width and height
var w = 400;
var h = 400;
var padding = 10;
var border = 1;
var bordercolor = 'black';

var example_solution = "// from back to red \n" + 
"rotate(135.00) \n" + 
"scale(1.5,1.5) \n" + 
"translate(3,2) \n" + 
"\n" + 
"// from red to blue \n" + 
"scale(-1,-1) \n" + 
"translate(-2,-2) \n" + 
"\n" + 
"// from blue to green \n" + 
"translate(5,4)\n" + 
"rotate(90)\n" + 
"scale(1.5,1.0)\n" + 
"translate(-5,5)";

var waypoints = [ { 'color' : 'red',
					'points' : [[7,6], [7, 2], [9, 2]] },
                 
				 { 'color' : 'blue',
					'points' : [[-5,6], [-5, 2], [-7, 2]]},	
					
				 { 'color' : 'green',
					'points' : [[-1,-7], [-1,-5], [-2,-5]]},
					
				{ 'color' : 'purple',
					'points' : [[7,-4], [5, -4], [5, -5]] }
					];
    
var dataset = [
               [0,2],
               [0,0],
               [1,0]
           ];

// create scale functions
var xScale = d3.scale.linear()
    .domain([-10, 10])
    .range([padding, w - padding * 2]);

var yScale = d3.scale.linear()
    .domain([-10, 10])
    .range([h - padding, padding]);


var dx = xScale(0);
var sx = xScale(1)-dx;


var dy = yScale(0);
var sy = yScale(1)-dy;



//Create SVG element
var svg = d3.select("#figure")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("border", border);

//define X axis
var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(10)
    .tickSize(-h, 0, 0); //Set rough # of ticks

//Define Y axis
var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(10)
    .tickSize(-w, 0, 0);

//   draw axes here
svg.append("g")
    .attr("class", "axis") //assign "axis" class
.attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "axis") //assign "axis" class
.attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);

//Draw a grid
var numberOfTicks = 12;

var yAxisGrid = yAxis.ticks(numberOfTicks)
    .tickSize(w, 0)
    .tickFormat("")
    .orient("right");

var xAxisGrid = xAxis.ticks(numberOfTicks)
    .tickSize(-h, 0)
    .tickFormat("")
    .orient("top");

svg.append("g")
    .classed('y', true)
    .classed('grid', true)
    .call(yAxisGrid);

svg.append("g")
    .classed('x', true)
    .classed('grid', true)
    .call(xAxisGrid);

//create the circles
svg.append("g").selectAll("circle")
.data(dataset)
.enter()
.append("circle")
.attr("cx", function (d) { return xScale(d[0]); })
.attr("cy", function (d) { return yScale(d[1]); })
.attr("r", 2)
.style("fill", "black");


for (waypoint of waypoints){
    console.log(waypoint)
	//create the circles
	svg.append("g").selectAll("circle")
	    .data(waypoint['points'])
	    .enter()
	    .append("circle")
	    .attr("cx", function (d) { return xScale(d[0]); })
	    .attr("cy", function (d) { return yScale(d[1]); })
	    .attr("r", 2)
	    .style("fill", waypoint['color']);
	
}



//This is the accessor function we talked about above
var lineFunction = d3.svg.line()
                         .x(function(d) { return d[0]; })
                         .y(function(d) { return d[1]; })
                         .interpolate("linear");

var shape_container = svg.append("g")
	.attr("transform", "translate(" + dx + "," + dy + ") scale(" + sx + "," + sy + ")");



function showCommandSequence(transformation_commands){
	
	var transformation_groups = []
	var cur_group = shape_container;
	for (var i = transformation_commands.length-1; i >= 0; --i) {
		console.log(i)
		var time = transformation_commands.length*1000 - 1000*transformation_groups.length
		cur_group = cur_group.append("g");
		cur_group.transition()
			.delay( time)  
			.attr("transform", transformation_commands[i]);
		transformation_groups.push(cur_group);
	}
	
	var shape = cur_group.append("g")
	
	shape.append("path").attr("d", function(d) { return lineFunction(dataset) + "Z"; })
					  .attr("vector-effect", "non-scaling-stroke")
				      .attr("stroke", "blue")
				      .attr("stroke-width", -1)
				      .attr("fill", "none");
}


/* Example definition of a simple mode that understands a subset of
 * JavaScript:
 */

CodeMirror.defineSimpleMode("transforms", {
  // The start state contains the rules that are intially used
  start: [
    // The regex matches the token, the token property contains the type
    {token: "keyword", regex: /(?:rotate|translate|scale)\b/},
    {token: "number", regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i},
    {token: "comment", regex: /\/\/.*/,},
    {regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},
    // A next property will cause the mode to move to a different state
    {regex: /\/\*/, token: "comment", next: "comment"},
  ],
  // The multi-line comment state.
  comment: [
    {regex: /.*?\*\//, token: "comment", next: "start"},
    {regex: /.*/, token: "comment"}
  ],
  // The meta property contains global information about the mode. It
  // can contain properties like lineComment, which are supported by
  // all modes, and also directives like dontIndentStates, which are
  // specific to simple modes.
  meta: {
    dontIndentStates: ["comment"],
    lineComment: "//"
  }
});




 var codeEditor = CodeMirror($('#code_editor').get(0), {
	  value: example_solution,
	  mode:  "transforms",
	  lineNumbers: true,
	});

 
function run(){
	var text = codeEditor.getValue();
	var lines = text.split("\n");
	var fl = "\\s*[+-]?((\\d+(\\.\\d*)?)|(\\.\\d+))\\s*"
	//var re = new RegExp("(^translate\(-?\d+,-?\d+\)\s*$)|^rotate\(-?\d+\)\s*$|(^scale\(-?\d+,-?\d+\)\s*$)");
	//var re = /(^translate\(-?\d+,-?\d+\)\s*$)|(^rotate\(-?\d+\)\s*$)|(^scale\(-?\d+,-?\d+\)\s*$)/m;
	
	//var re = new RegExp("(^translate\\(-?\\d+,-?\\d+\\)\\s*$)|(^rotate\\(-?\\d+\\)\\s*$)|(^scale\\(-?\\d+,-?\\d+\\)\\s*$)", "m");
	var command_re = new RegExp("(^translate\\("+fl+","+fl+"\\)\\s*$)|(^rotate\\("+fl+"\\)\\s*$)|(^scale\\("+fl+","+fl+"\\)\\s*$)", "m");
	
	var comment_re = new RegExp("(^\\s*//.*$)|(^\\s*$)", "m");
	
	
	var commands = []
	var error_lines = []
	for (var i =0; i < lines.length; ++i){
		var line = lines[i];
		var is_comment = comment_re.test(line);
		var is_command = command_re.test(line);
	    console.log(i + ' comment:' + is_comment + ' command:' + is_command + ' ' + line);
		
		
		if (is_command){
			commands.push(line);
		}
		else if (is_comment){

		}
		else {
			error_lines.push(i+1);
		}
		
	}
	if (error_lines.length){
		alert('errors on lines: ' + error_lines)
	}
	else{
		showCommandSequence(commands);
	}
	
 }
 
 $('#run_button').click(run)
 
};

 
$(function() { init();})
