
 nestGraph = {
    'init': function() {
            var device_id = 1;

            // change this if you want to limit the amount of data pulled
            var hours = 24 * 5;

			var first_date = "2014-05-16 00:00:00";

            var customTimeFormat = d3.time.format.multi([
              [".%L", function(d) { return d.getMilliseconds(); }],
              [":%S", function(d) { return d.getSeconds(); }],
              ["%H:%M", function(d) { return d.getMinutes(); }],
              ["%H:%M", function(d) { return d.getHours(); }],
              ["%a %-d", function(d) { return d.getDay() && d.getDate() != 1; }],
              ["%-d %b", function(d) { return d.getDate() != 1; }],
              ["%B", function(d) { return d.getMonth(); }],
              ["%Y", function() { return true; }]
            ]);

            var graph_info = {
                fullWidth : window.innerWidth * 0.97,

                fullHeight : window.innerHeight * 0.95,

				get_plot_info_var : function(name){
					var i;
					for( i = 0; i < this.plot_info_arr.length; i += 1) {
						if(this.plot_info_arr[i].name === name) {
							return this.plot_info_arr[i];
						}
					}
				},

                plot_info_arr : [
                   {
                      name : "Energy",
                      height : window.innerWidth * 0.80 * .25,
                      width : window.innerWidth * 0.80,
                      margin : {top: 60, right: 60, bottom: 0, left: 50},
                      hasRightAxis : true
                      },

                   {
                      name : "Energy Brush",
                      height : 100,
                      width : window.innerWidth * 0.80,
                      margin : {top: 60, right: 60, bottom: 0, left: 50},
                      hasRightAxis : false
                      },

                   {
                      name : "Log Data",
                      height : window.innerWidth * 0.80 * .2,
                      width : window.innerWidth * 0.80,
                      margin : {top: 60, right: 60, bottom: 0, left: 50},
                      hasRightAxis : false
                      },
                   {
                         name : "Humidity Data",
                         height : window.innerWidth * 0.80 * .15,
                         width : window.innerWidth * 0.80,
                         margin : {top: 60, right: 60, bottom: 0, left: 50},
                         hasRightAxis : true
                         },

                   {
                      name : "Events",
                      height : 400,
                      width : window.innerWidth * 0.80,
                      margin : {top: 60, right: 60, bottom: 0, left: 50},
                      hasRightAxis : false
                      },
				   {
                      name : "Cycles",
                      height : 80,
                      width : window.innerWidth * 0.80,
                      margin : {top: 60, right: 60, bottom: 0, left: 50},
                      hasRightAxis : false
                      },
                   ],

                   set_x_y_scale : function() {
                      var i;
                      for( i = 0; i < this.plot_info_arr.length; i += 1) {
                        var this_plot = this.plot_info_arr[i];
                        var x = d3.time.scale().range([0, this_plot.width]);
                        var y = d3.scale.linear().range([this_plot.height, 0]);

                        this_plot.x = x;
                        this_plot.y = y;
                        this_plot.y2 = y2;
                        this_plot.xAxis = d3.svg.axis().
                          scale(x)
                          .orient("bottom")
                          .ticks(this_plot.width/80)
                          .tickFormat(customTimeFormat);

                         this_plot.yAxis = d3.svg.axis()
                          .scale(y)
                          .orient("left");
                        if(this_plot.hasRightAxis === true) {
                          var y2 = d3.scale.linear().range([this_plot.height, 0]);
                          this_plot.y2 = y2;
                          this_plot.yRightAxis = d3.svg.axis()
                            .scale(y2)
                            .orient("right");
                        }
                      }
                      this.calc_height();
                   },

                   calc_height : function() {
                      var total_height = 0;
                      for( i = 0; i < this.plot_info_arr.length; i += 1) {
                        this.plot_info_arr[i].height_offset = total_height;
                        total_height += this.plot_info_arr[i].margin.top + this.plot_info_arr[i].height;

                      }
                      this.fullHeight = total_height + 50; //Leave a margin of on the bottom
                   },

                   append_plots : function(svg) {
                      var i;
                      var total_offset = 0;
                      for( i = 0; i < this.plot_info_arr.length; i += 1) {
                        var this_plot = this.plot_info_arr[i];
                        total_offset += this_plot.margin.top;

                        this_plot.svg_plot = svg.append("g")
                          .attr("transform", "translate(" + this_plot.margin.left + "," + total_offset + ")");
                         total_offset += this_plot.height;
                      }
                   },

                   clearData : function() {
                      var i;
                      var total_offset = 0;
                      for( i = 0; i < this.plot_info_arr.length; i += 1) {
                        var this_plot = this.plot_info_arr[i];
                        this_plot.svg_plot.selectAll("rect").remove();
                        this_plot.svg_plot.selectAll(".plot").remove();
                        this_plot.svg_plot.selectAll(".x.axis").remove();
                        this_plot.svg_plot.selectAll(".y.axis").remove();
                      }
                   }

            };

          var line_colors = {
              colors: {
                heating: d3.rgb('#993300'),
                cooling: d3.rgb('#84c4fa'),
                fan: d3.rgb('#fce692'),
                humid: d3.rgb('#608f1b'),
                dehumid: d3.rgb('#ffe4c4'),
                autoAway: d3.rgb('#003399'),
                manualAway: d3.rgb('#cc6600'),
                leaf: d3.rgb('#005500'),
                target: d3.rgb('#9c399c'),
                current: "black",
                humidity: d3.rgb('#608f1b'),
                outsideTemperature: "blue",
				outsideHumidity: d3.rgb('#e98f1a'),
				outsidePressure: d3.rgb('#00bdb6'),
				daily_temperature_average: d3.rgb('#621d30'),
				daily_temperature_min: d3.rgb('#4169e1'),
				daily_temperature_max: d3.rgb('#cd0000')

              },

              random_color: d3.scale.category10(),

              get_color: function(key) {
                var color = this.colors[key];
                if( color == undefined) {
                  color = this.random_color(key);
                }
                return color;
              }

          };

		  String.prototype.capitalizeFirst = function() {
				return this.charAt(0).toUpperCase() + this.slice(1);
		  }

          graph_info.set_x_y_scale();

          //console.log("Length: " + graph_info.plot_info_arr.length);
          parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

          color = d3.scale.category10();

          // d3 brush object for lower plot area (panning/zooming)
           brush = d3.svg.brush()
            .x(graph_info.plot_info_arr[1].x)
            .on("brush", brushUpdate);

          // create main svg object
           svg = d3.select("body").append("svg")
            .attr("width", graph_info.fullWidth)
            .attr("height", graph_info.fullHeight)

          // create clip path so zoomed-in paths can't extend beyond the zoomed-out frame
          svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", graph_info.plot_info_arr[0].width)
            .attr("height", graph_info.plot_info_arr[0].height);

          graph_info.append_plots(svg);


		  var brush_update_in_progress = false;
          // callback function for d3 brush object
          function brushUpdate() {
            brush_main_plot = graph_info.plot_info_arr[0];
            brush_small_plot = graph_info.plot_info_arr[1];
            brush_main_plot.x.domain(brush.empty() ? brush_small_plot.x.domain() : brush.extent());

            //console.log(brush.extent());
            brush_domain = brush.extent();
            brush_domain_time = [];
            var short_date_format = d3.time.format("%Y-%m-%d");
            brush_domain_time[0] = short_date_format(brush_domain[0]);
            brush_domain_time[1] = short_date_format(new Date(+brush_domain[1] + 86400000));
            //console.log(brush_domain_time);

			//Prevent multiple redraws/queries while brush is moving
			if(brush_update_in_progress === false) {
				brush_update_in_progress = true;
	            setTimeout(function() {
					fetchData(brush_domain_time);
					//fetchCycles(brush_domain_time);
					brush_update_in_progress = false;}, 250);
			}

            /*
            brush_main_plot.svg_plot.select(".x.axis").call(brush_main_plot.xAxis);
            brush_main_plot.x.domain(brush_domain);

            //brush_main_plot.svg_plot.focus.select(".x.axis").call(xAxis);

            brush_main_plot.rect.selectAll("rect")
              .data(function(d) { return d.values; } )
              .enter()
              .append("rect")
              .attr("x", function(d) { return brush_main_plot.xAxis(d.date); })
              .attr("y", function(d) { return brush_main_plot.y(d.val); })
              .attr("width", function(d) { return (brush_main_plot.width / data.length) - 1; }) // - 1 for paeeing
              .attr("height", function(d) { return brush_main_plot.height - brush_main_plot.y(d.val); })
              .attr("fill", function(d) { return d.color; })
              .attr("fill-opacity", .5);
             */
            /*
            brush_main_plot.svg_plot.selectAll("rect")
                .attr("transform", "translate(" + d3.event.translate[0] +
                      ",0)scale(" + d3.event.scale + ", 1)");
            */
            /*
            brush_main_plot.svg_plot.selectAll(".plot path")
              .attr("d", function(d) {
                return brush_main_plot.line(d.values);
              })

              */
          };

          function computeAverageTemp(timeRange) {
			var fetch_string;
			var parsed_data;
			if(typeof(timeRange) !== "undefined") {
				fetch_string = "id=" + device_id + "&start=\"" + timeRange[0] + "\"&end=\"" + timeRange[1] + "\""  + "&data=dailyTemp";

				d3.json("fetch.php?" + fetch_string, function(error, data) {
					parsed_data = data;
				});
			}
			return parsed_data;
          };

          function fetchEnergy() {
          // fetch the data
          d3.json("fetch.php?id=" + device_id + "&hrs=" + hours + "&data=energy", function(error, data) {
            this_plot = graph_info.get_plot_info_var("Energy");;
            this_brush_plot = graph_info.get_plot_info_var("Energy Brush");
            //console.log(data);

            var data_array = [];
            var temperature_array = {
                daily_temperature_average : [],
                daily_temperature_max : [],
                daily_temperature_min : []
                };


            data.forEach(function(d) {
              for( var key in d) {
                var xcolor = "black";
                var xval = 0;
                if  (key == "cooling") {
                  xval = d.cooling / 60;
                }
                else if (key == "heating") {
                  xval = d.heating / 60;
                }
                else if (key == "fan") {
                  xval = d.fan / 60;
                }
                else if (key == "humid") {
                  xval = d.humid / 60;
                }
                else if (key == "dehumid") {
                  xval = d.dehumid / 60;
                }

				if(xval !== 0)
			  	{
                	data_array.push( { name: key,
                                    color: line_colors.get_color(key),
                                    val: xval,
                                    date: parseDate(d.timestamp)
                                    } );
				}
              }

			  //Parse the date
			  d.date = parseDate(d.timestamp);

              //Simply reload to get the appropriate values
              if(d.temperature_avg == null)
              {
				  var earliest_date = parseDate(first_date);
				  if(+d.date > +earliest_date)
				  {
					var date_range = [];
					var short_date_format = d3.time.format("%Y-%m-%d");
					date_range[0] = short_date_format(d.date);
					date_range[1] = short_date_format(new Date(+d.date + 86400000));
					value_array = computeAverageTemp(date_range);

					if(value_array != undefined)
					{
						temperature_array.daily_temperature_average.push( { date: d.date,
																			val: parseInt(value_array.temperature_avg)});
						temperature_array.daily_temperature_max.push( { date: d.date,
																			val: parseInt(value_array.temperature_max)});
						temperature_array.daily_temperature_min.push( { date: d.date,
																		val: parseInt(value_array.temperature_min)});
					}
				  }
              }
              else
              {
                temperature_array.daily_temperature_average.push( { date: d.date,
                                                                    val: parseInt(d.temperature_avg)});
                temperature_array.daily_temperature_max.push( { date: d.date,
                                                                    val: parseInt(d.temperature_max)});
                temperature_array.daily_temperature_min.push( { date: d.date,
                                                                    val: parseInt(d.temperature_min)});
              }

            });


            // define the x-domains (i.e. min and max of actual date values)
            var date_domain = d3.extent(data, function(d) { return d.date; });
            //console.log (date_domain);
            date_domain[1] = new Date(+date_domain[1] + 86400000); //add an extra day
            this_plot.x.domain(date_domain);
            this_brush_plot.x.domain(date_domain);

            // define the y-domains (i.e. min and max of the union of all the trendlines)
            var y_domain = [0,
                d3.max(data_array, function(d) { return d.val; } ) * 1.1 ];
            this_plot.y.domain(y_domain);
            this_brush_plot.y.domain(y_domain);

			var y_temperature_domain = [-10, //d3.min(temperature_array.daily_temperature_min, function(d) { return d.val;} ),
										d3.max(temperature_array.daily_temperature_max, function(d) { return d.val;} ) ];
			y_temperature_domain[0] -=	y_temperature_domain[0]*.05;
			y_temperature_domain[1] +=	y_temperature_domain[1]*.05;
			this_plot.y2.domain(y_temperature_domain);



            // draw nest_data_plot x axis
            this_plot.svg_plot.append("g")
              .attr("class", "x axis nest_data_plot")
              .attr("transform", "translate(0," + this_plot.height + ")")
              .call(this_plot.xAxis);

            // draw nest_data_plot y axis
            this_plot.svg_plot.append("g")
              .attr("class", "y axis nest_data_plot")
              .call(this_plot.yAxis)
              .append("text")
//              .attr("transform", "rotate(-90)")
//              .attr("y", 6)
              .attr("y", -23)
              .attr("x", 50)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Duration (Minutes)");

			// draw the temperature y axis
			this_plot.svg_plot.append("g")
              .attr("class", "y axis nest_data_plot")
              .attr("transform", "translate(" + (this_plot.width+15) + ",0)")
              .call(this_plot.yRightAxis)
              .append("text")
              //.attr("transform", "rotate(-90)")
              .attr("y", -23)
              .attr("x", 50)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Temperature (" + temperature_units + ")");

            // draw the brush plot x-axis
            this_brush_plot.svg_plot.append("g")
              .attr("class", "x axis brush")
              .attr("transform", "translate(0," + this_brush_plot.height + ")")
              .call(this_brush_plot.xAxis);

            // draw the brush plot y-axis
            this_brush_plot.svg_plot.append("g")
              .attr("class", "y axis brush")
              .call(this_brush_plot.yAxis)
              .append("text")
            //  .attr("transform", "rotate(-90)")
              .attr("y", -23)
              .attr("x", 50)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Duration (Minutes)");

            // draw the energy data stacked histogram
            this_plot.svg_plot.selectAll(".plot.energies")
              .data(data_array.sort(function(a, b){return b.val-a.val})) //Sort the data so smaller rects are drawn over larger.
              .enter()
              .append("rect")
              .attr("class", function(d) { return "plot duration"})
              .attr("x", function(d) { return this_plot.x(d.date); })
              .attr("y", function(d) { return this_plot.y(d.val); })
              .attr("width", function(d) { return (this_plot.width / data.length) - 1; }) // - 1 for paeeing
              .attr("height", function(d) { return this_plot.height - this_plot.y(d.val); })
              .attr("fill", function(d) { return d.color; })
              .attr("fill-opacity", 1);

            // draw some transparent full height rectangles that have a tooltip for each day with all the values
            var rect_tooltip_date_format = d3.time.format("%Y-%m-%d (%a)");
            this_plot.svg_plot.selectAll(".plot.energies")
              .data(data)
              .enter()
              .append("rect")
              .attr("class", function(d) { return "plot tooltips"})
              .attr("x", function(d) { return this_plot.x(d.date); })
              .attr("y", function(d) { return 0; })
              .attr("width", function(d) { return (this_plot.width / data.length) - 1; }) // - 1 for 1px padding
              .attr("height", function(d) { return this_plot.height; })
              .attr("fill-opacity", 0)
              .append("svg:title")
              .text(function(d) {
                  var tooltip_string = rect_tooltip_date_format(d.date) + "\n" +
                      "heating: " + d.heating/60 + "\n" +
                      "cooling: " + d.cooling/60 + "\n" +
                      //fan doesn't ever seem to have non-zero values
					  "fan: " + d.fan/60 + "\n" +
					  "humidifier: " + d.humid/60 + "\n" +
                      "dehumidifier: " + d.dehumid/60+ "\n" +
                      "leaf: " + d.leaf;
                  return  tooltip_string;
              });

            // bind data to the brush plot
            this_brush_plot.svg_plot.selectAll(".plot.energies")
              .data(data_array.sort(function(a, b){return b.val-a.val}))
              .enter()
              .append("rect")
              .attr("class", function(d) { return "plot duration"})
              .attr("x", function(d) { return this_brush_plot.x(d.date); })
              .attr("y", function(d) { return this_brush_plot.y(d.val); })
              .attr("width", function(d) { return (this_brush_plot.width / data.length) - 1; }) // - 1 for 1px padding
              .attr("height", function(d) { return this_brush_plot.height - this_brush_plot.y(d.val); })
              .attr("fill", function(d) { return d.color; })
              .attr("fill-opacity", 1);

            // draw the d3 pan/zoom "brush" object
            this_brush_plot.svg_plot.append("g")
              .attr("class", "x brush")
              .call(brush)
              .selectAll("rect")
              .attr("y", -6)
              .attr("height", this_brush_plot.height + 7);

			var line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return this_plot.x(d.date); })
                .y(function(d) { return this_plot.y2(d.val); });

			for (var key in temperature_array){
				if (temperature_array.hasOwnProperty(key)) {
					 this_plot.svg_plot
				      .append("path")
					  .attr("class", "line")
					  .attr("d", function(d){ return line(temperature_array[key]); })
					  .style("stroke", line_colors.get_color(key));
				}
			}

          } //End fetchEnergy()
          )};

          function fetchData (timeRange) {
          var fetch_string;
          if(typeof(timeRange) !== "undefined") {
            fetch_string = "id=" + device_id + "&start=\"" + timeRange[0] + "\"&end=\"" + timeRange[1] + "\"";
          }
          else {
            fetch_string = "id=" + device_id + "&hrs=" + hours;
          }
          // fetch the data
          //console.log(fetch_string);
          d3.json("fetch.php?" + fetch_string, function(error, data) {
            this_plot = graph_info.get_plot_info_var("Log Data");
            humid_plot = graph_info.get_plot_info_var("Humidity Data");
            events_plot = graph_info.get_plot_info_var("Events");


            this_plot.svg_plot.selectAll(".plot").remove();
            this_plot.svg_plot.selectAll(".x.axis").remove();
            this_plot.svg_plot.selectAll(".y.axis").remove();
            svg.selectAll(".legend").remove();

            humid_plot.svg_plot.selectAll(".plot").remove();
            humid_plot.svg_plot.selectAll(".x.axis").remove();
            humid_plot.svg_plot.selectAll(".y.axis").remove();

            events_plot.svg_plot.selectAll(".plot").remove();
            events_plot.svg_plot.selectAll(".x.axis").remove();
            events_plot.svg_plot.selectAll(".y.axis").remove();

            color.domain(d3.keys(data[0]).filter(function(key) { return (key == "current" || key == "target" //|| key == "target2"
                || key == "humidity" || key == "outsideTemperature" || key == "outsideHumidity" || key == "outsidePressure"
                || key == 'heating' || key == 'cooling' || key == 'fan' || key == 'autoAway'
                || key == 'manualAway' || key == 'leaf'); }));
            data.forEach(function(d) {
              d.date = parseDate(d.timestamp);
            });

             points = color.domain().map(function(name) {
               x = {
                name: name,
                values: data.map(function(d) {
                    var xval = +d[name];
                    switch(name) {
                      case "heating":
                          xval += 12;
                          break;
                      case "cooling" :
                          xval += 10;
                          break;
                      case "fan" :
                          xval += 8;
                          break;
                      case "autoAway" :
                          xval += 6;
                          break;
                      case "manualAway" :
                          xval += 4;
                          break;
                      case "leaf" :
                          xval += 2;
                          break;
                      case "target2":
                      case "target" :
                          break;
                      case "current" :
                          xcolor = "black";
                          break;
                      case "humidity":
                          break;
                      case "outsideTemperature":
                          break;
                      default:
                          break;
                     }
                    if(name == "target2") {
                      return { date: d.date, val: d[name] };
                    }
                    //if( d[name] == null)
                    //else
                          //return { date: d.date, val: +d[name] };
                    else
                       xmode = "black";
                      if  (d["cooling"] == 1) {
                        xmode = "blue";
                      }
                      else if (d["heating"] == 1) {
                        xmode =  "red";
                      }

                      return { date: d.date,
                          val: xval,
                          mode: xmode,
                          color: line_colors.get_color(name)
                          };
                    })
                 };
              //console.log(x);
              return x;
            });


            // define the x-domains (i.e. min and max of actual date values)
            var x_domain = d3.extent(data, function(d) { return d.date; });
            this_plot.x.domain(x_domain);
            humid_plot.x.domain(x_domain);

            // define the y-domains (i.e. min and max of the union of all the trendlines)
            this_plot.y.domain([
                +d3.min(points, function(c) { if (c.name == "target" //|| (c.name == "target2" && c.values != null)
                || c.name == "current" || c.name == "outsideTemperature"
                ) { return d3.min(c.values, function(v) { return v.val }); } else { return undefined; } }) - 1,
                +d3.max(points,  function(c) { if (c.name == "target" //|| (c.name == "target2" && c.values != null)
                || c.name == "current" || c.name == "outsideTemperature"
                ) { return d3.max(c.values, function(v) { return v.val }); } else { return undefined; } }) + 1
            ]);

            humid_plot.y.domain([
                +d3.min(points, function(c) { if (c.name == "outsidePressure"
                ) { return d3.min(c.values, function(v) { return v.val }); } else { return undefined; } }) - 1,
                +d3.max(points,  function(c) { if (c.name == "outsidePressure"
                ) { return d3.max(c.values, function(v) { return v.val }); } else { return undefined; } }) + 1
            ]);
            humid_plot.y2.domain([0, 100]);
//                +d3.min(points, function(c) { if (c.name == "humidity" || c.name == "outsideHumidity"  ) { return d3.min(c.values, function(v) { return v.val }); } else { return undefined; } }) - 1,
//                +d3.max(points, function(c) { if (c.name == "humidity" || c.name == "outsideHumidity"  ) { return d3.max(c.values, function(v) { return v.val }); } else { return undefined; } }) + 1
//            ]);

            //Setup the events plot axis
            events_plot.x.domain(x_domain);
            events_plot.y.domain([0, 14]); // Fixed number of events all 0/1

            // draw nest_data_plot x axis
            this_plot.svg_plot.append("g")
              .attr("class", "x axis nest_data_plot")
              .attr("transform", "translate(0," + this_plot.height + ")")
              .call(this_plot.xAxis);

            // draw nest_data_plot y axis
            this_plot.svg_plot.append("g")
              .attr("class", "y axis nest_data_plot")
              .call(this_plot.yAxis)
              .append("text")
//              .attr("transform", "rotate(-90)")
              .attr("y", -23)
              .attr("x", 0)
//              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "middle")
              .text("Temperature (" + temperature_units + ")");

            // draw nest_data_plot x axis
            humid_plot.svg_plot.append("g")
              .attr("class", "x axis nest_data_plot")
              .attr("transform", "translate(0," + humid_plot.height + ")")
              .call(humid_plot.xAxis);

            // draw nest_data_plot y axis
            humid_plot.svg_plot.append("g")
              .attr("class", "y axis nest_data_plot")
              .call(humid_plot.yAxis)
              .append("text")
//              .attr("transform", "rotate(-90)")
//              .attr("y", 6)
              .attr("y", -23)
              .attr("x", 0)
              .attr("dy", ".71em")
              .style("text-anchor", "middle")
              .text("Pressure (hPa)");

            humid_plot.svg_plot.append("g")
              .attr("class", "y axis nest_data_plot")
              .attr("transform", "translate(" + (humid_plot.width+15) + ",0)")
              .call(humid_plot.yRightAxis)
              .append("text")
//              .attr("transform", "rotate(-90)")
//              .attr("y", -12)
              .attr("y", -23)
              .attr("x", 0)
              .attr("dy", ".71em")
              .style("text-anchor", "middle")
              .text("Humidity (%)");


            // draw events x axis
            events_plot.svg_plot.append("g")
              .attr("class", "x axis events")
              .attr("transform", "translate(0," + events_plot.height + ")")
              .call(events_plot.xAxis);

            // draw events y axis
            events_plot.svg_plot.append("g")
              .attr("class", "y axis events")
              .call(events_plot.yAxis)
              .append("text")
              .attr("y", -23)
              .attr("x", 0)
//              .attr("transform", "rotate(-90)")
//              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "middle")
              .text("Event");

            // bind nest_data_plot current/trendlines
            this_plot.svg_plot.selectAll(".plot.temps")
              .data(points.filter(function(f) { return (f.name == 'current' || f.name == 'outsideTemperature'
              || f.name == 'target' || (f.name == 'target2' && f.values != null)  ); }))
              .enter().append("g")
              .attr("class", function(d) { return "plot temps " + d.name; });

            humid_plot.svg_plot.selectAll(".plot.temps")
              .data(points.filter(function(f) { return ( f.name == "outsideHumidity" || f.name == "outsidePressure"
              || f.name == 'humidity'  ); }))
              .enter().append("g")
              .attr("class", function(d) { return "plot temps " + d.name; });


            // bind date for events
            events_plot.svg_plot.selectAll(".plot.temps")
              .data(points.filter(function(f) { return (f.name == 'heating' || f.name == 'cooling' || f.name == 'fan' || f.name == 'autoAway' ||
                          f.name == 'manualAway' || f.name == 'leaf'); }))
              .enter().append("g")
              .attr("class", function(d) { return "plot temps " + d.name; });



            //Create the line objects once
			var line = d3.svg.line()
				.interpolate("basis")
				.x(function(d) { return this_plot.x(d.date); })
				.y(function(d) { return this_plot.y(d.val); });

			var lineStepafter = d3.svg.line()
				.interpolate("step-after")
				.x(function(d) { return this_plot.x(d.date); })
				.y(function(d) { return this_plot.y(d.val); });

			var lineRight = d3.svg.line()
				  .interpolate("basis")
				  .x(function(d) { return this_plot.x(d.date); })
				  .y(function(d) { return this_plot.y2(d.val); });


  			var lineH = d3.svg.line()
  				.interpolate("basis")
  				.x(function(d) { return humid_plot.x(d.date); })
  				.y(function(d) { return humid_plot.y(d.val); });

  			var lineStepafterH = d3.svg.line()
  				.interpolate("step-after")
  				.x(function(d) { return humid_plot.x(d.date); })
  				.y(function(d) { return humid_plot.y(d.val); });

  			var lineRightH = d3.svg.line()
  				  .interpolate("basis")
  				  .x(function(d) { return humid_plot.x(d.date); })
  				  .y(function(d) { return humid_plot.y2(d.val); });


            //All events are step after (logical 0/1)
            if (typeof events_plot.lineStepafter === 'undefined') {
              events_plot.lineStepafter = d3.svg.line()
                .interpolate("step-after")
                .x(function(d) { return events_plot.x(d.date); })
                .y(function(d) { return events_plot.y(d.val); });
            }

            // draw nest_data_plot current/target/furnace trendlines
            this_plot.svg_plot.selectAll(".plot")
              .append("path")
              .attr("class", "line")
              .attr("d", function(d) {
                if (d.name == "current" || d.name == "outsideTemperature"
                 )
                    return line(d.values);
                else if (d.name == "humidity" || d.name == "outsideHumidity" || d.name == "outsidePressure")
                    return lineRight(d.values);
                else
                    return lineStepafter(d.values);
              	})
              .style("stroke", function(d) {
                  return d.values[0].color;
             	 })
			  .style('pointer-events', 'none');
              //.attr("clip-path", "url(#clip)");

            humid_plot.svg_plot.selectAll(".plot")
              .append("path")
              .attr("class", "line")
              .attr("d", function(d) {
                if (d.name == "outsidePressure"
                 )
                    return lineH(d.values);
                else if (d.name == "humidity" || d.name == "outsideHumidity" )
                    return lineRightH(d.values);
                else
                    return lineStepafterH(d.values);
              	})
              .style("stroke", function(d) {
                  return d.values[0].color;
             	 })
			  .style('pointer-events', 'none');
              //.attr("clip-path", "url(#clip)");

            // draw events plots
            events_plot.svg_plot.selectAll(".plot")
              .append("path")
              .attr("class", "line")
              .attr("d", function(d) {
                    return events_plot.lineStepafter(d.values);
              	})
              .style("stroke", function(d) {
                  return d.values[0].color;
              	})
			  .style('pointer-events', 'none');

            // create a parent element for the circles to live
            this_plot.svg_plot.selectAll(".current")
              .append("g")
              .attr("class", "circles")
              .attr("clip-path", "url(#clip)");

            // draw the circles with tooltips
            format = d3.time.format("%a %-d %b %Y %H:%M:%S");
            this_plot.svg_plot.selectAll(".circles").selectAll(".thecircles")
              .data((points.filter(function(f) { return f.name == 'current'; }))[0].values)
              .enter().append("circle")
              .attr("cx", function(d) { return this_plot.x(d.date); })
              .attr("cy", function(d) { return this_plot.y(d.val); })
              .attr("r", 5)
              .attr("stroke", function(d) { return (d.mode); })
              .attr("fill", function(d) { return (d.mode); })
              .attr("opacity", 0.2)
              .append("svg:title").text(function(d) {
                return format(d.date) + "\n" + d.val + "\u00B0 " + temperature_units;
              });

            // draw legend
             legend = svg.append("g")
              .attr("class", "legend")
              .attr("x", 365)
              .attr("y", this_plot.height_offset + this_plot.height)
              .attr("height", 100)
              .attr("width", 100);

            legend.selectAll('g')
            .data(points.filter(function(f) { return f.name != 'target2'; }))
            .enter()
            .append('g')
            .each(function(d, i) {
                g = d3.select(this);
               g.append("rect")
                 .attr("x", this_plot.width + 90)
                 .attr("y", this_plot.height_offset + this_plot.height + i*25)
                 .attr("width", 10)
                 .attr("height", 10)
                 .style("fill", function(d) { return d.values[0].color; });

               g.append("text")
                 .attr("x", this_plot.width + 105)
                 .attr("y", this_plot.height_offset + this_plot.height + i * 25 + 8)
                 .attr("height",30)
                 .attr("width",100)
                 .style("fill", function(d) { return d.values[0].color; })
                 .text(d.name);

            });

			//Add a mouseover event that draws a line and updates the values at this location
			/*
			var marker = this_plot.svg_plot.append('g')
   			  .attr("class", "mouse circles")
			  .append("circle")
			  .attr('r', 20)
			  .style('display', 'none')
			  .style('fill', '#000000')
			  .style('pointer-events', 'none')
			  .style('stroke', '#FB5050')
			  .style('stroke-width', '3px');

			this_plot.svg_plot
			.on('mouseover', function() {
				  marker.style('display', 'inherit');
				})
			.on('mouseout', function() {
				  marker.style('display', 'none');
				})
			.on('mousemove', function() {
   				  var mouse = d3.mouse(this);
				  marker
				  	.attr('cx', mouse[0])
				  	.attr('cy', mouse[1]);
			});
			*/


			//End for data
			fetchCycles (timeRange, x_domain);
          });
          };

		  function fetchCycles (timeRange, domain) {
          var fetch_string;
          if(typeof(timeRange) !== "undefined") {
            fetch_string = "id=" + device_id + "&start=\"" + timeRange[0] + "\"&end=\"" + timeRange[1] + "\"" + "&data=cycles";
          }
          else {
            fetch_string = "id=" + device_id + "&hrs=" + hours + "&data=cycles";
          }

          // fetch the data
          //console.log(fetch_string);
          d3.json("fetch.php?" + fetch_string, function(error, data) {
            this_plot = graph_info.get_plot_info_var("Cycles");

            this_plot.svg_plot.selectAll(".plot").remove();
            this_plot.svg_plot.selectAll(".x.axis").remove();
            this_plot.svg_plot.selectAll(".y.axis").remove();

			var data_array = [];
            var cycle_type_to_string = {
				1 : "heating",
				65792 : "cooling",
				65536 : "fan",
				81921 : "humidity"
				}

            data.forEach(function(d) {

				if(d.duration !== 0)
				{
					var start_date = parseDate(d.timestamp);
					var start_timestamp = +start_date + (d.start * 1000);
					var end_timestamp = start_timestamp + (d.duration * 1000);

					data_array.push( { type: d.type,
										name: cycle_type_to_string[d.type],
										color: line_colors.get_color(cycle_type_to_string[d.type]),
										start: new Date(start_timestamp),
										end: new Date(end_timestamp),
										duration: d.duration
									} );
				}

			  //Parse the date
			  d.date = parseDate(d.timestamp);
            });

			// define the x-domains (i.e. min and max of actual date values)
			//if(domain == "undefined")
			//{
				var date_domain = d3.extent(data, function(d) { return d.date; });
				//console.log (date_domain);
				date_domain[1] = new Date(+date_domain[1] + 86400000); //add an extra day
				this_plot.x.domain(date_domain);
			//}
			//else
			//{
			//	this_plot.x.domain(domain);
			//}


			//match the x-domain to the events plot so they line up nicely.
			//var events_plot = graph_info.get_plot_info_var("Events");
			//var events_x_domain = events_plot.x.domain();
			//this_plot.x.domain(events_x_domain);

            // define the y-domains (i.e. min and max of the union of all the trendlines)
            var y_domain = [0, 1]; // This can be fixed since we're only drawing events in time
            this_plot.y.domain(y_domain);


            // draw nest_data_plot x axis
            this_plot.svg_plot.append("g")
              .attr("class", "x axis nest_data_plot")
              .attr("transform", "translate(0," + this_plot.height + ")")
              .call(this_plot.xAxis);

            // draw nest_data_plot y axis
			/*
            this_plot.svg_plot.append("g")
              .attr("class", "y axis nest_data_plot")
              .call(this_plot.yAxis)
              .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Duration (Minutes)");*/

			  this_plot.svg_plot.selectAll(".plot.energies")
				  .data(data_array.sort(function(a, b){return b.type-a.type}))
				  .enter()
				  .append("rect")
				  .attr("class", function(d) { return "plot cycles"})
				  .attr("x", function(d) { return this_plot.x(d.start); })
				  .attr("y", function(d) { return 0; })
				  .attr("width", function(d) { return (this_plot.x(d.end) - this_plot.x(d.start) ); })
				  .attr("height", function(d) { return this_plot.height; })
				  .attr("fill", function(d) { return d.color; })
				  .attr("fill-opacity", .8)
				  .append("svg:title")
				  .text(function(d) {
					  var tooltip_string = d.name.capitalizeFirst() + ":\n" +
						  "Start: " + d.start + "\n" +
						  "End: " + d.end + "\n" +
						  //fan doesn't ever seem to have non-zero values
						  "Duration: " + d.duration/60 + "Minutes \n";
					  return  tooltip_string;
				  });

          });
          };

          fetchEnergy();
          fetchData();
		  //fetchCycles();


          window.onload=function(){
            document.getElementById("device_id").onchange=
            function () {
                   aList = document.getElementById("device_id");
                  device_id = aList.options[aList.selectedIndex].value;
            graph_info.clearData();
            fetchEnergy();
            fetchData();
            if (!brush.empty()) {
              brushUpdate();
            }
            };

          };

    }
};

nestGraph.init();
//document.write("Device ID: " + nestGraph.device_id);
