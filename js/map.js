var map;

require([
	"esri/map",
	"esri/geometry/Extent",
	"esri/layers/GraphicsLayer",
	"esri/layers/FeatureLayer",
	"esri/layers/ArcGISTiledMapServiceLayer",
	"esri/layers/ArcGISDynamicMapServiceLayer",
	"esri/toolbars/draw",
    "esri/graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
     "esri/symbols/SimpleFillSymbol",
     "esri/tasks/QueryTask",
     "esri/tasks/query",
     "esri/request",
     "esri/InfoTemplate",
     "esri/geometry/mathUtils",
     "esri/dijit/TimeSlider",
     "esri/TimeExtent",
     
     "esri/renderers/SimpleRenderer",
     "esri/renderers/UniqueValueRenderer",
     "esri/renderers/ClassBreaksRenderer",
     "esri/tasks/IdentifyTask",
     "esri/tasks/IdentifyParameters",
     "dojo/request",     
     "dojo/on","dojo/dom","esri/Color",
     "dojo/_base/connect",
     "dojo/parser", "dijit/registry",
     "dijit/layout/BorderContainer",
      "dijit/layout/ContentPane",
      "dijit/form/Button",
	"dojo/domReady!"
	],
	function(
		Map,Extent,GraphicsLayer,
		FeatureLayer,
		ArcGISTiledMapServiceLayer,
		ArcGISDynamicMapServiceLayer,
		Draw, Graphic, 
		SimpleMarkerSymbol,
		SimpleLineSymbol,
		SimpleFillSymbol,
		QueryTask,Query,
		esriRequest,
		InfoTemplate,
		mathUtils,
		TimeSlider,
		TimeExtent,
		
		SimpleRenderer,UniqueValueRenderer,
		ClassBreaksRenderer,
		IdentifyTask,IdentifyParameters,
		request,
		on,dom,Color,Connect,
		parser, registry
		
	){
		var toolbar;
		var tranferDate;
		var visibles = [];
		var level = 0;
		var flag="region";
		var identifyTask, identifyParams;
		var baseUrl = "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer";
		var dUrl = "http://mahongwang:6080/arcgis/rest/services/air_lili/MapServer";
		
		var initExtent = new Extent({
			"xmin": 7397177.673660297,
			"ymin": 1998723.5105398588,
			"xmax": 16706596.222566009,
			"ymax": 6484659.826539091,
			"spatialReference":{
				"wkid":102100
			}
		});
		map = new Map("map",{
			logo:false,
			extent:initExtent
		});
		var baselayer = new ArcGISTiledMapServiceLayer(baseUrl);
		var dlayer = new ArcGISDynamicMapServiceLayer(dUrl);
		var temporal_featureLayer;
		
		var fillselectionLayer = new GraphicsLayer();
		var fillRenderer = new SimpleRenderer(new SimpleFillSymbol());
		fillselectionLayer.setRenderer(fillRenderer);
		
		var markerselectionLayer = new GraphicsLayer();
		var markerRenderer = new SimpleRenderer(new SimpleMarkerSymbol());
		markerselectionLayer.setRenderer(markerRenderer);
		
		var lineselectionLayer = new GraphicsLayer();
		var lineRenderer = new SimpleRenderer(new SimpleLineSymbol());
		lineselectionLayer.setRenderer(lineRenderer);
		
		
		visibles = [4];
		dlayer.setVisibleLayers(visibles);
		map.addLayer(baselayer);
		map.addLayer(dlayer);
		map.addLayer(fillselectionLayer);
		map.addLayer(markerselectionLayer);
		map.addLayer(lineselectionLayer);
		
		/*
		cellData = jc_site;
		
		
		*/
        //var map_click = map.on("click", doIdentify);
        var map_click = Connect.connect(dom.byId("map"),"click",doIdentify);
        //机场接收事件
        document.addEventListener("datachange", function(event){
        	
        	map.graphics.clear();
			var cellData = event.data;
			console.log(cellData);
			
			if(cellData!=""){
			var type = cellData.type;
			var code = cellData.code;
			var queryUrl = dUrl;
			var query = new Query();
			switch(type){
				case "hkfq":
					queryUrl = dUrl + "/3";
					query.where = "code = '"+code+"'";
					break;
				case "sj":
					queryUrl = dUrl + "/4";
					query.where = "code = '"+code+"'";
					break;
				case "hx":
					queryUrl = dUrl + "/2";
					query.where = "code = '"+code+"'";
					break;
				case "jc":
					queryUrl = dUrl + "/1";
					query.where = "Code = '"+code+"'";
					break;
				case "hkgs":
					queryUrl = dUrl + "/0";
					query.where = "Code = '"+code+"'";
					break;
			}
			//query.where = "1=1";
			query.outFields = ["*"];
			query.returnGeometry = true;
			console.log(query);
			var queryTask = new QueryTask(queryUrl);
			
			queryTask.execute(query, function(featureSet){
				
				map.graphics.clear();				
				if(featureSet.features.length >0){
					//showGraphics(featureSet);
					var symbol = new SimpleMarkerSymbol(
							SimpleMarkerSymbol.STYLE_SQUARE,18,
							new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
								new Color([25,250,20]), 1),
								new Color([20,250,0,0.25])
							);
					var gg = new Graphic(featureSet.features[0].geometry, symbol);
					map.graphics.add(gg);
					map.centerAndZoom(featureSet.features[0].geometry,8);
					//var extent = featureSet.features[0].geometry.getExtent();
					//map.setExtent(extent*1.5);
				}
				
				
			});
		}
			
		}, false);
        //空管区/省级接收事件
        document.addEventListener("zoomzone", function(event){
        	
        	map.graphics.clear();
        	var data = event.data;
        	var type = data.type;
        	var code = data.code;        	
        	switch(type){
        		case "hkfq":
        		//alert("hkfq");
        			var matchs = hkfq_ceters.data;
        			//console.log(matchs);
        			for(var i = 0;i < matchs.length;i++){
        				if(code == matchs[i].code){
        					var center = matchs[i].center;
        					map.centerAndZoom(center,6);
        				}
        			}
        			break;
        		case "sj":
        			var matchs = province_centers.data;
        			for(var i = 0;i < matchs.length;i++){
        				if(code == matchs[i].code){
        					var center = matchs[i].center;
        					map.centerAndZoom(center,7);
        				}
        			}
        			break;
        	}
        }, false);
        //航线接收
        document.addEventListener("zoomairline", function(event){
        	
        	map.graphics.clear();
        	var data = event.data;
        	var type = data.type;
        	var name = data.name;
        	var code = data.code;
        	var query = new Query();
        	query.where = "code = '"+code+"'";
        	
        	query.outFields = ["*"];
			query.returnGeometry = true;
			//console.log(query);
			var queryTask = new QueryTask(dUrl+"/3");
			
			queryTask.execute(query,function(featureSet){
				console.log(featureSet);
				map.graphics.clear();				
				if(featureSet.features.length >0){
					//showGraphics(featureSet);
					var symbol = new SimpleLineSymbol(
								SimpleLineSymbol.STYLE_SOLID,
								new Color([75,205,50]),5
								);
					var gg = new Graphic(featureSet.features[0].geometry, symbol);
					map.graphics.add(gg);
					
					var extent = featureSet.features[0].geometry.getExtent().expand(1.5);
					map.setExtent(extent);
					
				}
				
				
			});
        	
        }, false);
        //航线报警接收
        document.addEventListener("warnairline", function(event){
        	var data = event.data;
        	map.graphics.clear();
        	console.log(data[0]);
        	
        	for(var i = 0;i < data.length; i++){
        		
        		var type = data[i].type;
	        	var name = data[i].name;
	        	var code = data[i].code;
	        	
	        	var query = new Query();
	        	query.where = "code = '"+code+"'";
	        	
	        	query.outFields = ["*"];
				query.returnGeometry = true;
				//console.log(query);
				var queryTask = new QueryTask(dUrl+"/3");
				
				queryTask.execute(query,function(featureSet){
					
					if(featureSet.features.length >0){
						
						var symbol = new SimpleLineSymbol(
									SimpleLineSymbol.STYLE_SOLID,
									new Color([255,20,20]),5
									);
						var gg = new Graphic(featureSet.features[0].geometry, symbol);
						map.graphics.add(gg);						
						
					}
					
					
				});
        		
        	}
        	
        	
        }, false);
        //时间渲染事件
        document.addEventListener("temporalrender", function(event){
        	var data = event.data;
        	map.graphics.clear();
        	fillselectionLayer.clear();
        	markerselectionLayer.clear();
        	lineselectionLayer.clear();
        	document.getElementById("timePane").style.display = "block";
        	temporalRenderer(data);
        },false);
        //取消时间渲染事件
        document.addEventListener("removetemporalrender", function(event){
        	map.graphics.clear();
        	fillselectionLayer.clear();
        	markerselectionLayer.clear();
        	lineselectionLayer.clear();
        	map.removeLayer(temporal_featureLayer);
        	//dom.byId("timeSlider").innerHTML = "";
			document.getElementById("timePane").style.display = "none";
        },false);
        
        map.on("load", function(){
        	toolbar = new Draw(map);
        	toolbar.on("draw-end", addToMap);
        	       	
        });
        //map.on("layers-add-result",initSlider);
        
        map.on("extent-change",function(evt){
        	if(flag!="region"){return;}
        	//console.log(evt);
        	//map.graphics.clear();
        	fillselectionLayer.clear();
        	
        		var mapCenter = evt.extent.getCenter();
        		caculateMinDis(Number.parseInt(level),mapCenter);
	        		 
	        	if(level >= 6){
	        		//dojo.disconnect(dom.byId("map"),"click",doIdentify);
	        		Connect.disconnect(map_click);
	        	}
	        	
        	
        });
        map.on("zoom-end",function(evt){
        	if(flag == "region"){        		
        		//map.graphics.clear();
	        	fillselectionLayer.clear();
	        	level = Number.parseInt(evt.level);
	        	console.log(evt);//evt.anchor .extent .level .target .zoomFactor
        		
        		if(level < 6){
	        		visibles = [4];
					dlayer.setVisibleLayers(visibles);
					//map.on("click",doIdentify);
					Connect.connect(map_click);
	        	} else if(level == 6){
	        		visibles = [4];
					dlayer.setVisibleLayers(visibles);
					//dojo.disconnect(dom.byId("map"),"click",doIdentify);
					//map.on("click",null);
					Connect.disconnect(map_click);
	        	}
	        	else if(level > 6){
	        		visibles = [4,5];
					dlayer.setVisibleLayers(visibles);
					//dojo.disconnect(dom.byId("map"),"click",doIdentify);
					//map.on("click",null);
					Connect.disconnect(map_click);
	        	}
        	}
        	
        	
        	
        	
        });
         map.on("pan-end",function(){
         	//map.graphics.clear();
         	if(flag == "region"){
         		if(level >= 6){
        		//dojo.disconnect(map_click);
        		map.on("click",null);
	        	}
	        	else if(level <6){
	        		dojo.connect(map_click);
	        	}else if(level == 7){
	        		fillselectionLayer.clear();
	        	}
         	}
         	
         	
         });
         map.on("pan-start",function(){
         	//map.graphics.clear();
         	
         	if(flag == "region"){
         		if(level >= 6){
	        		//dojo.disconnect(map_click);
	        		map.on("click",null);
	        	}
	        	else if(level <6){
	        		dojo.connect(map_click);
	        	}else if(level == 7){
	        		fillselectionLayer.clear();
	        	}
         	}
         	
         	
         });
        map.on("mouse-drag",function(evt){
        	
        		
        		if(level >= 6){
	        		//dojo.disconnect(map_click);
	        		map.on("click",null);
	        	}
	        	else if(level <6){
	        		dojo.connect(map_click);
	        	}else if(level == 7){
	        		fillselectionLayer.clear();
	        	}
        	
        	
        	//Connect.disconnect(Connect.connect(map,"onclick",doIdentify));
        });
        map.on("mouse-drag-end",function(evt){
        	//Connect.connect(map,"onclick",doIdentify);
        	if(flag == "region"){
        		if(level >= 6){
	        		//dojo.disconnect(map_click);
	        		map.on("click",null);
	        	}
	        	else if(level <6){
	        		dojo.connect(map_click);
	        	}else if(level == 7){
	        		fillselectionLayer.clear();
	        	}
        	}
        });
        
        
        function caculateMinDis(level, mapCenter){
        	if(level == null){return;} 
        	var graphics_centers = hkfq_ceters.data;
        	var pro_centers = province_centers.data;
        	//console.log(pro_centers);
        	var lens = [];
        	var pro_lens = [];
        	var data={};
        	
        	if(level == 6){
        		
        		for(var i = 0;i <graphics_centers.length; i++){
        			var graCenter = graphics_centers[i].center;
        			
        			var len = mathUtils.getLength(mapCenter,graCenter);
        			var code = graphics_centers[i].code;
        			var name = graphics_centers[i].name;
        			lens.push({name:name,len:len, code:code});
        		}
        		var lenMin = {};
        		lenMin.len = lens[0].len;
        		lenMin.name = lens[0].name;
        		lenMin.code = lens[0].code;
        		for(var j = 1; j< lens.length; j++){
        			
        			if(lens[j].len < lenMin.len){
        				lenMin.len = lens[j].len;
        				lenMin.name = lens[j].name;
        				lenMin.code = lens[j].code;
        			}
        		}
        		doSearch("region", lenMin.code);
        		data.type="hkfq";
        		data.name = lenMin.name;
        		data.code = lenMin.code;
        		//console.log(lens);
        		//console.log(lenMin);
        		
        	}
        	else if(level == 7){       		
        		
        		for(var i = 0;i <pro_centers.length; i++){
        			var proCenter = pro_centers[i].center;
        			//map.graphics.add(graCenter,new SimpleMarkerSymbol());
        			var len = mathUtils.getLength(mapCenter,proCenter);
        			var code = pro_centers[i].code;
        			var name = pro_centers[i].name;
        			pro_lens.push({name:name,len:len, code:code});
        		}
        		var lenMin = {};
        		lenMin.len = pro_lens[0].len;
        		lenMin.name = pro_lens[0].name;
        		lenMin.code = pro_lens[0].code;
        		for(var j = 1; j< pro_lens.length; j++){
        			
        			if(pro_lens[j].len < lenMin.len){
        				lenMin.len = pro_lens[j].len;
        				lenMin.name = pro_lens[j].name;
        				lenMin.code = pro_lens[j].code;
        				console.log(lenMin);
        			}
        		}
        		doSearch("province", lenMin.code);
        		data.type="sj";
        		data.name = lenMin.name;
        		data.code = lenMin.code;
        	}
        	//传递数据，缩放时候空管区/省的数据
        	console.log(data);
        	
        }
        function doSearch(type, code){
        	var queryUrl;
        	switch(type){
        		case "region":
        			queryUrl = dUrl + "/4";
        			break;
        		case "province":
        			queryUrl = dUrl + "/5";
        			break;
        	}
        	var query = new Query();
			query.where = "code = '"+code+"'";
			query.outFields = ["*"];
			query.returnGeometry = true;
			console.log(query);
			var queryTask = new QueryTask(queryUrl);
			queryTask.execute(query, function(featureSet){
				if(featureSet.features.length > 0){
					var feature = featureSet.features[0];
					var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
    new Color([25,250,20]), 1),new Color([20,250,0,0.25]));
    							
    					fillselectionLayer.clear();
						var gg = new Graphic(feature.geometry, symbol);
						fillselectionLayer.add(gg);
    					fillselectionLayer.setVisibility(true);	
				}
			});
        	
        }
       
        function doIdentify(event){
        	
        	map.graphics.clear();
        	fillselectionLayer.clear();
        	markerselectionLayer.clear();
        	lineselectionLayer.clear();
        	identifyTask = new IdentifyTask("http://mahongwang:6080/arcgis/rest/services/air_lili/MapServer");
        	identifyParams = new IdentifyParameters();
        	
        	identifyParams.layerOption  =  IdentifyParameters.LAYER_OPTION_ALL;
            identifyParams.tolerance = 10;
            identifyParams.returnGeometry = true;
            identifyParams.width = map.width;
            identifyParams.height = map.height;
            var layerIds;
            switch(flag){
            	case "region":
            		layerIds = [4];
            		break;
            	case "airport":
            		layerIds = [1];
            		break;
            	case "airline":
            		layerIds = [3];
            		break;
            	case "company":
            		layerIds = [0];
            		break;
            }
        	identifyParams.layerIds = layerIds;
        	
        	 //console.log(identifyParams.layerIds);
        	 identifyParams.geometry = event.mapPoint;
             identifyParams.mapExtent = map.extent;
             identifyTask.execute(identifyParams, showResults);
        }
        function showResults(results){
        		var data = {};
             	var symbol;
             	var feature = results[0].feature;
             	//console.log(feature);
             	var geometry = results[0].feature.geometry;
             	geometry.setSpatialReference(map.spatialReference);
             	             	
             		var geometryType = results[0].geometryType;
             		
             		switch(geometryType){
             			case "esriGeometryPolygon":
             				symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
    new Color([25,250,20]), 1),new Color([20,250,0,0.25]));
    							
    							fillselectionLayer.add(new Graphic(geometry, symbol));
    							fillselectionLayer.setVisibility(true);
    							
    							data.type = "hkfq";
             					data.name = feature.attributes.Region;
             					data.code = feature.attributes.code;
    							
             				break;
             				
             			case "esriGeometryPoint":
             				
	             			symbol = new SimpleMarkerSymbol(
							SimpleMarkerSymbol.STYLE_SQUARE,18,
							new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
								new Color([25,250,20]), 1),
								new Color([20,250,0,0.25])
							);
							markerselectionLayer.add(new Graphic(geometry,symbol));	
							markerselectionLayer.setVisibility(true);
							
							///////////////////////need modified
							if(flag == "airport"){
								data.type = "jc";
		             			data.name = feature.attributes.Name;
		             			data.code = feature.attributes.Code;
							} else if(flag == "company"){
								data.type = "hkgs";
		             			data.name = feature.attributes.NAME;
		             			data.code = feature.attributes.CODE;
							}
							
							
							break;
						
						case "esriGeometryPolyline":
             				
	             			symbol = new SimpleLineSymbol(
								SimpleLineSymbol.STYLE_SOLID,
								new Color([0,255,0]),2
								);
							lineselectionLayer.add(new Graphic(geometry,symbol));	
							lineselectionLayer.setVisibility(true);
							
							data.type = "hx";
	             			data.name = feature.attributes.code;
	             			data.code = feature.attributes.code;
							
							break;
             		}
             		
             		//对象传递data，单击事件后的数据
             		console.log(data);
             		
             }
		
		function addToMap(evt){
			var symbol;
			toolbar.deactivate();
			map.showZoomSlider();
			switch(evt.geometry.type){
				case "point":
					symbol = new SimpleMarkerSymbol();
					break;
				case "extent":
					symbol = new SimpleFillSymbol();
					break;
			}
			var graphic = new Graphic(evt.geometry, symbol);
			map.graphics.add(graphic);
			doQuery(evt.geometry);
		}
		function doQuery(geometry){
			var queryUrl = dUrl;
			switch(flag){
				case "region":
					queryUrl += "/4";
					break;
				case "airport":
					queryUrl += "/1";
					break;
				case "airline":
					queryUrl += "/3";
					break;
				case "company":
					queryUrl += "/0";
					break;
			}
			var query = new Query();
			query.geometry = geometry;
			query.outFields = ["*"];
			query.returnGeometry = true;
			var queryTask = new QueryTask(queryUrl);
			queryTask.execute(query, showGraphics);
			
		}
		function showGraphics(featureSet){
			console.log(featureSet);
			var dataset = new Array();
			map.graphics.clear();
			var geometryType = featureSet.geometryType;
			var resultCount = featureSet.features.length;
			var symbol;
			switch(geometryType){
				case "esriGeometryPolygon":
					symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
    new Color([25,250,20]), 1),new Color([20,250,0,0.25]));
					break;
				case "esriGeometryPoint":
					symbol = new SimpleMarkerSymbol(
						SimpleMarkerSymbol.STYLE_SQUARE,18,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
							new Color([255,0,0]), 2.5),
							new Color([0,255,0,0.25])
						);
					break;
				case "esriGeometryPolyline":
					symbol = new SimpleLineSymbol(
						SimpleLineSymbol.STYLE_SOLID,
						new Color([0,255,0]),4
						);
					break;
			}
			//var hkfq_centers =[];
			for(var i=0; i<resultCount; i++){
				var geometry = featureSet.features[i].geometry;
				geometry.setSpatialReference(map.spatialReference);
				
				var graphic = new Graphic(geometry, symbol);
				map.graphics.add(graphic);
				var feature = featureSet.features[i];
				//console.log(feature);
				//获取所有空管局的中心点 
				/*
				var obj = {};
				obj.name = feature.attributes.NAME;
				obj.code = feature.attributes.Code;
				obj.center = geometry.getCentroid();
				hkfq_centers.push(obj);	
				*/
				
				var data = {};
				if(geometryType == "esriGeometryPolygon"){
					data.type= "hkfq";
					data.name = feature.attributes.Region;
					data.code = feature.attributes.code;
				}
				else if(geometryType == "esriGeometryPoint"){
					if(flag == "airport"){
						data.type = "jc";
						data.name = feature.attributes.Name;
						data.code = feature.attributes.Code;
					} else if(flag == "company"){
						data.type = "hkgs";
						data.name = feature.attributes.NAME;
						data.code = feature.attributes.CODE;
					}
					
				}
				else if(geometryType == "esriGeometryPolyline"){
					data.type = "hx";
					data.name = feature.attributes.code;
					data.code = feature.attributes.code;
				}
				dataset.push(data);
				
				
			}
			
			
			////对象数组传递，批量查询传递的数据
			console.log(dataset);
			
			
		}
		
		//时态渲染
		var regions = [];
		function temporalRenderer(regionData){
			if(flag == "region"){
				
			 temporal_featureLayer = new FeatureLayer(dUrl +"/4", {
			 	  id:"tempFl",
		          mode: FeatureLayer.ON_DEMAND,
		          trackIdField:"code",		          
		          outFields: ["*"]
		     });
		     map.addLayer(temporal_featureLayer);
		     
		     
			//console.log(regionData);
			var data = regionData.data;
			var len =data.length;
			var timelen = data[0].values.length;
			var names = [];
			var value_prices =[];
			var value_quans = [];	
			var timeEx = [];
			var startTime = new Date(data[0].values[0].time);			
			var endTime = new Date(data[0].values[timelen-1].time);
			var timeExtent = new TimeExtent(startTime,endTime);
			
			tranferDate = startTime;
			
			var labels = [];
			for(var i = 0; i< timelen;i++){
				var time = new Date(data[0].values[i].time);
				var label = time.getFullYear()+"年"+(time.getMonth()+1)+"月";
				labels.push(label);
			}
			
			var timeSlider = new TimeSlider({
					style:"width:100%;"
				},dom.byId("timeSlider"));
	        //map.setTimeSlider(timeSlider);	        
			
          	  timeSlider.setThumbCount(1);
	          timeSlider.createTimeStopsByTimeInterval(timeExtent, 1, "esriTimeUnitsMonths");
	          timeSlider.setThumbIndexes([0,1]);
	          timeSlider.setThumbMovingRate(1000);
	          timeSlider.setLoop(true);
	          timeSlider.setLabels(labels);
	          timeSlider.startup();
				console.log(timeExtent);
				timeSlider.on("time-extent-change",renderer);
			
			
			
			for(var j=0;j<timelen;j++){
				
				for(var i = 0;i <len; i++){
					var obj={};
					obj.name = data[i].name;
					obj.type = data[i].type;
					obj.code = data[i].code;
					
					obj.time = data[i].values[j].time;
					obj.value_price = data[i].values[j].value_price;
					obj.value_quan = data[i].values[j].value_quan;
					regions.push(obj);
					//console.log(regions);
				
					
				}
				
			}
			console.log(regions);
			 
			  var br = new ClassBreaksRenderer(null, caculatePrice);
			  var outline = SimpleLineSymbol("solid", new Color("#444"), 1);
			   br.addBreak(0, 250, new SimpleFillSymbol("solid", outline, new Color([255, 255, 178, 0.55])));
            	br.addBreak(251, 500, new SimpleFillSymbol("solid", outline, new Color([254, 204, 92, 0.55])));
            	br.addBreak(501, 750, new SimpleFillSymbol("solid", outline, new Color([253, 141, 60, 0.55])));
            	br.addBreak(751, 1000, new SimpleFillSymbol("solid", outline, new Color([227, 26, 28, 0.55])));

            temporal_featureLayer.setRenderer(br);
            temporal_featureLayer.redraw();
            //console.log("rendering");
            temporal_featureLayer.on("mouse-over",function(evt){
            	//console.log(getName(evt.graphic));
            	document.getElementById("legend").style.display = "block";
            	//console.log(document.getElementById("legend").style.display);
            	var name = getName(evt.graphic)+"&nbsp;&nbsp; "+getTime(evt.graphic);
            	var content = "平均票价："+caculatePrice(evt.graphic)+"\n吞吐量:"+caculateQuan(evt.graphic);
            	document.getElementById("legend").innerHTML = name+"<br />"+content;
            	
            });
			
			temporal_featureLayer.on("mouse-out",function(){
				dom.byId("legend").innerHTML = "";
				document.getElementById("legend").style.display = "none";
			});
		}
		}
		var rendering_array;
		function renderer(evt){
			console.log(evt);
			rendering_array = new Array();
			var timeExtent = evt;
			var startYearVal = timeExtent.startTime.getFullYear();
			var endYearVal = timeExtent.endTime.getFullYear();
			var startMonthVal = timeExtent.startTime.getMonth()+1;
			var endMonthVal = timeExtent.endTime.getMonth()+1;
			
			//
			tranferDate = timeExtent.endTime;
			
			for(var i = 0;i <regions.length;i++){
				var dateVal = new Date(regions[i].time);
				var yearVal = dateVal.getFullYear();
				var monthVal = dateVal.getMonth()+1;
				if(monthVal==endMonthVal&&yearVal==endYearVal){
					console.log(regions[i].name+regions[i].value_price);
					rendering_array.push(regions[i]);
					
				}
			}
			var br = new ClassBreaksRenderer(null, caculatePrice_rendering);
			  var outline = SimpleLineSymbol("solid", new Color("#444"), 1);
			   br.addBreak(0, 250, new SimpleFillSymbol("solid", outline, new Color([255, 255, 178, 0.55])));
            	br.addBreak(251, 500, new SimpleFillSymbol("solid", outline, new Color([254, 204, 92, 0.55])));
            	br.addBreak(501, 750, new SimpleFillSymbol("solid", outline, new Color([253, 141, 60, 0.55])));
            	br.addBreak(751, 1000, new SimpleFillSymbol("solid", outline, new Color([227, 26, 28, 0.55])));

            temporal_featureLayer.setRenderer(br);
            temporal_featureLayer.redraw();
            //console.log("rendering");
            temporal_featureLayer.on("mouse-over",function(evt){
            	//console.log(getName(evt.graphic));
            	document.getElementById("legend").style.display = "block";
            	//console.log(document.getElementById("legend").style.display);
            	var name = getName_rendering(evt.graphic)+"&nbsp;&nbsp; "+getTime_rendering(evt.graphic);
            	var content = "平均票价："+caculatePrice_rendering(evt.graphic)+"\n吞吐量:"+caculateQuan_rendering(evt.graphic);
            	document.getElementById("legend").innerHTML = name+"<br />"+content;
            	
            });
			
			temporal_featureLayer.on("mouse-out",function(){
				dom.byId("legend").innerHTML = "";
				document.getElementById("legend").style.display = "none";
			});
			
			//传递endtime，更新图表
			console.log(tranferDate);
			
		}
		
		function getName(graphic){
			var code = graphic.attributes.code;
			  	  for(var i=0;i<regions.length;i++){
			  	  	if(regions[i].code == code){
			  	  		return regions[i].name;
			  	  	}
			  	  }
		}
		function getName_rendering(graphic){
			var code = graphic.attributes.code;
			  	  for(var i=0;i<rendering_array.length;i++){
			  	  	if(rendering_array[i].code == code){
			  	  		return rendering_array[i].name;
			  	  	}
			  	  }
		}
		function getTime(graphic){
			var code = graphic.attributes.code;
			  	  for(var i=0;i<regions.length;i++){
			  	  	if(regions[i].code == code){
			  	  		return regions[i].time;
			  	  	}
			  	  }
		}
		function getTime_rendering(graphic){
			var code = graphic.attributes.code;
			  	  for(var i=0;i<rendering_array.length;i++){
			  	  	if(rendering_array[i].code == code){
			  	  		return rendering_array[i].time;
			  	  	}
			  	  }
		}
		function caculatePrice(graphic){
			var code = graphic.attributes.code;
			  	  for(var i=0;i<regions.length;i++){
			  	  	if(regions[i].code == code){
			  	  		return regions[i].value_price;
			  	  	}
			  	  }
		}
		function caculatePrice_rendering(graphic){
			var code = graphic.attributes.code;
			  	  for(var i=0;i<rendering_array.length;i++){
			  	  	if(rendering_array[i].code == code){
			  	  		return rendering_array[i].value_price;
			  	  	}
			  	  }
		}
		function caculateQuan(graphic){
			var code = graphic.attributes.code;
			  	  for(var i=0;i<regions.length;i++){
			  	  	if(regions[i].code == code){
			  	  		return regions[i].value_quan;
			  	  	}
			  	  }
		}
		function caculateQuan_rendering(graphic){
			var code = graphic.attributes.code;
			  	  for(var i=0;i<rendering_array.length;i++){
			  	  	if(rendering_array[i].code == code){
			  	  		return rendering_array[i].value_quan;
			  	  	}
			  	  }
		}
		
		
		//图层显示控制
		on(dom.byId("region"),"click",function(){
			flag = "region";
			dojo.disconnect(map_click);
			map.graphics.clear();
        	fillselectionLayer.clear();
        	markerselectionLayer.clear();
        	lineselectionLayer.clear();
			visibles = [4];
			dlayer.setVisibleLayers(visibles);
			//console.log(level);
			//tabchange();
			if(level <6){
				Connect.connect(map_click);
			} else{
				Connect.disconnect(map_click);
			}
			
			
			
		});
		on(dom.byId("airport"),"click",function(){
			flag = "airport";
			//map.on("click",doIdentify);
			Connect.connect(dom.byId("map"),"click",doIdentify);
			map.graphics.clear();
        	fillselectionLayer.clear();
        	markerselectionLayer.clear();
        	lineselectionLayer.clear();
			visibles = [1,4,5];
			dlayer.setVisibleLayers(visibles);
			
		});
		on(dom.byId("airline"),"click",function(){
			flag = "airline";
			//map.on("click",doIdentify);
			Connect.connect(dom.byId("map"),"click",doIdentify);
			
			map.graphics.clear();
        	fillselectionLayer.clear();
        	markerselectionLayer.clear();
        	lineselectionLayer.clear();
			visibles = [2,3,4,5];
			dlayer.setVisibleLayers(visibles);
						
		});
		on(dom.byId("company"),"click",function(){
			flag = "company";
			//map.on("click",doIdentify);
			Connect.connect(dom.byId("map"),"click",doIdentify);
			
			map.graphics.clear();
        	fillselectionLayer.clear();
        	markerselectionLayer.clear();
        	lineselectionLayer.clear();
			visibles = [0,4,5];
			dlayer.setVisibleLayers(visibles);
						
		});
		//空间查询
		on(dom.byId("point"),"click",function(){
			map.graphics.clear();
        	fillselectionLayer.clear();
        	markerselectionLayer.clear();
        	lineselectionLayer.clear();
			toolbar.activate(Draw.CIRCLE);
			map.hideZoomSlider();
			
		});
		on(dom.byId("rectangle"),"click",function(){
			map.graphics.clear();
        	fillselectionLayer.clear();
        	markerselectionLayer.clear();
        	lineselectionLayer.clear();
			toolbar.activate(Draw.EXTENT);
			map.hideZoomSlider();
			
		});
		/*
		on(dom.byId("temporalRender"),"click",function(){
			map.graphics.clear();
        	fillselectionLayer.clear();
        	markerselectionLayer.clear();
        	lineselectionLayer.clear();
        	document.getElementById("timePane").style.display = "block";
			temporalRenderer();
			//map.hideZoomSlider();
			
		});
		on(dom.byId("removeTempLayer"),"click",function(){
			map.graphics.clear();
        	fillselectionLayer.clear();
        	markerselectionLayer.clear();
        	lineselectionLayer.clear();
        	map.removeLayer(temporal_featureLayer);
        	//dom.byId("timeSlider").innerHTML = "";
			document.getElementById("timePane").style.display = "none";
		});
		*/
		
	});


function zoomSite(){
	//调用document对象的 createEvent 方法得到一个event的对象实例。
	var event = document.createEvent('HTMLEvents');
	// initEvent接受3个参数：
	// 事件类型，是否冒泡，是否阻止浏览器的默认行为
	event.initEvent("datachange", true, true);
	event.data=jc_site;
	//触发document上绑定的自定义事件ondataavailable
	document.dispatchEvent(event);
}
function zoomZone(){
	//调用document对象的 createEvent 方法得到一个event的对象实例。
	var event = document.createEvent('HTMLEvents');
	// initEvent接受3个参数：
	// 事件类型，是否冒泡，是否阻止浏览器的默认行为
	event.initEvent("zoomzone", true, true);
	event.data=hkfq_site;
	//触发document上绑定的自定义事件ondataavailable
	document.dispatchEvent(event);
}
function zoomAirline(){
	//调用document对象的 createEvent 方法得到一个event的对象实例。
	var event = document.createEvent('HTMLEvents');
	// initEvent接受3个参数：
	// 事件类型，是否冒泡，是否阻止浏览器的默认行为
	event.initEvent("zoomairline", true, true);
	event.data=hx_site;
	//触发document上绑定的自定义事件ondataavailable
	document.dispatchEvent(event);
}
function warnAirline(){
	//调用document对象的 createEvent 方法得到一个event的对象实例。
	var event = document.createEvent('HTMLEvents');
	// initEvent接受3个参数：
	// 事件类型，是否冒泡，是否阻止浏览器的默认行为
	event.initEvent("warnairline", true, true);
	event.data=hx_warn;
	//触发document上绑定的自定义事件ondataavailable
	document.dispatchEvent(event);
}

function tempRender(){
	//调用document对象的 createEvent 方法得到一个event的对象实例。
	var event = document.createEvent('HTMLEvents');
	// initEvent接受3个参数：
	// 事件类型，是否冒泡，是否阻止浏览器的默认行为
	event.initEvent("temporalrender", true, true);
	event.data=regionData;
	//触发document上绑定的自定义事件ondataavailable
	document.dispatchEvent(event);
}
function RemovetempRender(){
	//调用document对象的 createEvent 方法得到一个event的对象实例。
	var event = document.createEvent('HTMLEvents');
	// initEvent接受3个参数：
	// 事件类型，是否冒泡，是否阻止浏览器的默认行为
	event.initEvent("removetemporalrender", true, true);
	event.data=regionData;
	//触发document上绑定的自定义事件ondataavailable
	document.dispatchEvent(event);
}


var jc_site = {
	type:"jc",
	name:"兴义兴义机场",
	code:"ACX"
	
}
var hkfq_site = {
	type:"hkfq",
	name:"东北空管局",
	code:"2"
}
var sj_site = {
	type:"sj",
	name:"四川省",
	code:"510000"
}
var hx_site = {
	type:"hx",
	name:"PEK-SHA",
	code:"PEK-SHA"
}

var hx_warn = [
	{		
		code:"PEK-PVG",
		max_price:"1510",
		min_price:"200",
		price:"890",
		warning:true
	},{
		code:"PEK-TAO",
		max_price:"1310",
		min_price:"180",
		price:"750",
		warning:true
	}
]
var hkfq_ceters = {
	data:[
		{
			name:"东北空管局",
			code:"2",
			center:{
				type:"point",
				x:14086774.842600413,
				y:5791506.519056605,
				spatialReference:{
					wkid:102100
				}
			}
		},
		{
			name:"华北空管局",
			code:"1",
			center:{
				type:"point",
				x:12730845.492775984,
				y:5357472.122877374,
				spatialReference:{
					wkid:102100
				}
			}
		},
		{
			name:"华东空管局",
			code:"3",
			center:{
				type:"point",
				x:13124548.792644836,
				y:3644664.6753802286,
				spatialReference:{
					wkid:102100
				}
			}
		},
		{
			name:"西北空管局",
			code:"6",
			center:{
				type:"point",
				x:11102143.765277065,
				y:4362988.409788389,
				spatialReference:{
					wkid:102100
				}
			}
		},
		{
			name:"西南空管局",
			code:"5",
			center:{
				type:"point",
				x:10616466.805061357,
				y:3507492.3072075844,
				spatialReference:{
					wkid:102100
				}
			}
		},
		{
			name:"新疆空管局",
			code:"7",
			center:{
				type:"point",
				x:9493860.859578809,
				y:5067224.005069455,
				spatialReference:{
					wkid:102100
				}
			}
		},
		{
			name:"中南空管局",
			code:"4",
			center:{
				type:"point",
				x:12446952.854994897,
				y:3251583.6783552114,
				spatialReference:{
					wkid:102100
				}
			}
		}
		
	]
}

var province_centers = {
	data:[
	{"name":"上海市","code":"310000","center":{"type":"point","x":13513460.763071725,"y":3644439.3184040356,"spatialReference":{"wkid":102100}}},{"name":"云南省","code":"530000","center":{"type":"point","x":11297235.734455884,"y":2877234.5105674244,"spatialReference":{"wkid":102100}}},{"name":"内蒙古自治区","code":"150000","center":{"type":"point","x":12722815.680232242,"y":5538356.1083821915,"spatialReference":{"wkid":102100}}},{"name":"北京市","code":"110000","center":{"type":"point","x":12958791.792656703,"y":4893281.605032658,"spatialReference":{"wkid":102100}}},{"name":"台湾省","code":"710000","center":{"type":"point","x":13466535.962068414,"y":2724264.512694137,"spatialReference":{"wkid":102100}}},{"name":"吉林省","code":"220000","center":{"type":"point","x":14045117.171517944,"y":5418966.140295584,"spatialReference":{"wkid":102100}}},{"name":"四川省","code":"510000","center":{"type":"point","x":11433559.34974612,"y":3589062.7589081265,"spatialReference":{"wkid":102100}}},{"name":"天津市","code":"120000","center":{"type":"point","x":13061068.722117685,"y":4766936.555554415,"spatialReference":{"wkid":102100}}},{"name":"宁夏回族自治区","code":"640000","center":{"type":"point","x":11818395.107091261,"y":4479578.513194676,"spatialReference":{"wkid":102100}}},{"name":"安徽省","code":"340000","center":{"type":"point","x":13049050.749178262,"y":3743767.058334096,"spatialReference":{"wkid":102100}}},{"name":"山东省","code":"370000","center":{"type":"point","x":13151654.737108655,"y":4348629.269124538,"spatialReference":{"wkid":102100}}},{"name":"山西省","code":"140000","center":{"type":"point","x":12501304.731538953,"y":4526047.758392481,"spatialReference":{"wkid":102100}}},{"name":"广东省","code":"440000","center":{"type":"point","x":12627107.0144881,"y":2676208.1492248084,"spatialReference":{"wkid":102100}}},{"name":"广西壮族自治区","code":"450000","center":{"type":"point","x":12110162.055110196,"y":2734511.128010905,"spatialReference":{"wkid":102100}}},{"name":"新疆维吾尔自治区","code":"650000","center":{"type":"point","x":9493860.859578867,"y":5067224.005069344,"spatialReference":{"wkid":102100}}},{"name":"江苏省","code":"320000","center":{"type":"point","x":13295420.58778106,"y":3894836.3625205443,"spatialReference":{"wkid":102100}}},{"name":"江西省","code":"360000","center":{"type":"point","x":12882569.887670277,"y":3203377.0120693874,"spatialReference":{"wkid":102100}}},{"name":"河北省","code":"130000","center":{"type":"point","x":12928078.334859023,"y":4808317.919837767,"spatialReference":{"wkid":102100}}},{"name":"河南省","code":"410000","center":{"type":"point","x":12647383.988338422,"y":4015786.0938641503,"spatialReference":{"wkid":102100}}},{"name":"浙江省","code":"330000","center":{"type":"point","x":13363229.367338363,"y":3398625.3568640403,"spatialReference":{"wkid":102100}}},{"name":"海南省","code":"460000","center":{"type":"point","x":12216493.76606977,"y":2177942.8824950876,"spatialReference":{"wkid":102100}}},{"name":"湖北省","code":"420000","center":{"type":"point","x":12497230.441607563,"y":3631379.968836647,"spatialReference":{"wkid":102100}}},{"name":"湖南省","code":"430000","center":{"type":"point","x":12435028.995738775,"y":3202360.901208916,"spatialReference":{"wkid":102100}}},{"name":"甘肃省","code":"620000","center":{"type":"point","x":11222271.900529427,"y":4573538.729946642,"spatialReference":{"wkid":102100}}},{"name":"福建省","code":"350000","center":{"type":"point","x":13133060.17738614,"y":3011182.0671503297,"spatialReference":{"wkid":102100}}},{"name":"西藏自治区","code":"540000","center":{"type":"point","x":9838951.574431503,"y":3706666.7872531815,"spatialReference":{"wkid":102100}}},{"name":"贵州省","code":"520000","center":{"type":"point","x":11897530.71942912,"y":3102113.0534985582,"spatialReference":{"wkid":102100}}},{"name":"辽宁省","code":"210000","center":{"type":"point","x":13649402.111391768,"y":5059781.876111015,"spatialReference":{"wkid":102100}}},{"name":"重庆市","code":"500000","center":{"type":"point","x":12009181.073507942,"y":3512733.658098993,"spatialReference":{"wkid":102100}}},{"name":"陕西省","code":"610000","center":{"type":"point","x":12120874.315572876,"y":4200344.379116257,"spatialReference":{"wkid":102100}}},{"name":"青海省","code":"630000","center":{"type":"point","x":10687153.363637654,"y":4274392.880995713,"spatialReference":{"wkid":102100}}},{"name":"香港特别行政区","code":"810000","center":{"type":"point","x":12708315.177430626,"y":2563036.198082208,"spatialReference":{"wkid":102100}}},{"name":"黑龙江省","code":"230000","center":{"type":"point","x":14213481.133061232,"y":6113161.561224741,"spatialReference":{"wkid":102100}}}] 
	
}




var regionData = {data:[
{
	"name":"东北空管局",
	"code":"2",
	"type":"region",
	"values":[
		{time:"2013/1/1", value_price:"175", value_quan:"2134"},
		{time:"2013/2/1", value_price:"475", value_quan:"5434"},
		{time:"2013/3/1", value_price:"275", value_quan:"3234"},
		{time:"2013/4/1", value_price:"675", value_quan:"1234"},
		{time:"2013/5/1", value_price:"775", value_quan:"6634"},
		{time:"2013/6/1", value_price:"375", value_quan:"7834"},
		{time:"2013/7/1", value_price:"455", value_quan:"4734"},
		{time:"2013/8/1", value_price:"655", value_quan:"8234"},
		{time:"2013/9/1", value_price:"445", value_quan:"3334"},
		{time:"2013/10/1", value_price:"875", value_quan:"9034"},
		{time:"2013/11/1", value_price:"665", value_quan:"6734"},
		{time:"2013/12/1", value_price:"905", value_quan:"7334"}
	]
},
{
	"name":"华北空管局",
	"code":"1",
	"type":"region",
	"values":[
		{time:"2013/1/1", value_price:"125", value_quan:"2534"},
		{time:"2013/2/1", value_price:"425", value_quan:"5734"},
		{time:"2013/3/1", value_price:"265", value_quan:"3534"},
		{time:"2013/4/1", value_price:"615", value_quan:"1834"},
		{time:"2013/5/1", value_price:"725", value_quan:"6134"},
		{time:"2013/6/1", value_price:"335", value_quan:"7134"},
		{time:"2013/7/1", value_price:"415", value_quan:"4934"},
		{time:"2013/8/1", value_price:"695", value_quan:"8634"},
		{time:"2013/9/1", value_price:"495", value_quan:"3934"},
		{time:"2013/10/1", value_price:"825", value_quan:"9134"},
		{time:"2013/11/1", value_price:"615", value_quan:"6234"},
		{time:"2013/12/1", value_price:"935", value_quan:"7834"}
	]
},
{
	"name":"华东空管局",
	"code":"3",
	"type":"region",
	"values":[
		{time:"2013/1/1", value_price:"215", value_quan:"2234"},
		{time:"2013/2/1", value_price:"245", value_quan:"3234"},
		{time:"2013/3/1", value_price:"625", value_quan:"7634"},
		{time:"2013/4/1", value_price:"165", value_quan:"2534"},
		{time:"2013/5/1", value_price:"555", value_quan:"3734"},
		{time:"2013/6/1", value_price:"325", value_quan:"6334"},
		{time:"2013/7/1", value_price:"385", value_quan:"5934"},
		{time:"2013/8/1", value_price:"525", value_quan:"7234"},
		{time:"2013/9/1", value_price:"585", value_quan:"5334"},
		{time:"2013/10/1", value_price:"625", value_quan:"7234"},
		{time:"2013/11/1", value_price:"525", value_quan:"5134"},
		{time:"2013/12/1", value_price:"795", value_quan:"6834"}
	]
},
{
	"name":"西北空管局",
	"code":"6",
	"type":"region",
	"values":[
		{time:"2013/1/1", value_price:"555", value_quan:"2534"},
		{time:"2013/2/1", value_price:"365", value_quan:"3734"},
		{time:"2013/3/1", value_price:"435", value_quan:"7334"},
		{time:"2013/4/1", value_price:"425", value_quan:"2934"},
		{time:"2013/5/1", value_price:"895", value_quan:"3134"},
		{time:"2013/6/1", value_price:"425", value_quan:"6934"},
		{time:"2013/7/1", value_price:"645", value_quan:"5334"},
		{time:"2013/8/1", value_price:"485", value_quan:"7734"},
		{time:"2013/9/1", value_price:"315", value_quan:"5934"},
		{time:"2013/10/1", value_price:"445", value_quan:"7634"},
		{time:"2013/11/1", value_price:"885", value_quan:"5534"},
		{time:"2013/12/1", value_price:"575", value_quan:"6134"}
	]
},
{
	"name":"西南空管局",
	"code":"5",
	"type":"region",
	"values":[
		{time:"2013/1/1", value_price:"425", value_quan:"3234"},
		{time:"2013/2/1", value_price:"256", value_quan:"4354"},
		{time:"2013/3/1", value_price:"765", value_quan:"5674"},
		{time:"2013/4/1", value_price:"234", value_quan:"4324"},
		{time:"2013/5/1", value_price:"689", value_quan:"4534"},
		{time:"2013/6/1", value_price:"521", value_quan:"5544"},
		{time:"2013/7/1", value_price:"547", value_quan:"2134"},
		{time:"2013/8/1", value_price:"378", value_quan:"3454"},
		{time:"2013/9/1", value_price:"675", value_quan:"6214"},
		{time:"2013/10/1", value_price:"876", value_quan:"5674"},
		{time:"2013/11/1", value_price:"456", value_quan:"9804"},
		{time:"2013/12/1", value_price:"767", value_quan:"4364"}
	]
},
{
	"name":"新疆空管局",
	"code":"7",
	"type":"region",
	"values":[
		{time:"2013/1/1", value_price:"715", value_quan:"1134"},
		{time:"2013/2/1", value_price:"356", value_quan:"2354"},
		{time:"2013/3/1", value_price:"455", value_quan:"5574"},
		{time:"2013/4/1", value_price:"744", value_quan:"8724"},
		{time:"2013/5/1", value_price:"499", value_quan:"9934"},
		{time:"2013/6/1", value_price:"371", value_quan:"6344"},
		{time:"2013/7/1", value_price:"907", value_quan:"5634"},
		{time:"2013/8/1", value_price:"678", value_quan:"3354"},
		{time:"2013/9/1", value_price:"475", value_quan:"4514"},
		{time:"2013/10/1", value_price:"776", value_quan:"7774"},
		{time:"2013/11/1", value_price:"316", value_quan:"6704"},
		{time:"2013/12/1", value_price:"497", value_quan:"8864"}
	]
},
{
	"name":"中南空管局",
	"code":"4",
	"type":"region",
	"values":[
		{time:"2013/1/1", value_price:"346", value_quan:"3334"},
		{time:"2013/2/1", value_price:"654", value_quan:"5554"},
		{time:"2013/3/1", value_price:"587", value_quan:"4474"},
		{time:"2013/4/1", value_price:"643", value_quan:"6524"},
		{time:"2013/5/1", value_price:"780", value_quan:"4834"},
		{time:"2013/6/1", value_price:"912", value_quan:"2344"},
		{time:"2013/7/1", value_price:"882", value_quan:"4934"},
		{time:"2013/8/1", value_price:"435", value_quan:"5754"},
		{time:"2013/9/1", value_price:"567", value_quan:"4814"},
		{time:"2013/10/1", value_price:"706", value_quan:"5574"},
		{time:"2013/11/1", value_price:"616", value_quan:"3804"},
		{time:"2013/12/1", value_price:"521", value_quan:"5264"}
	]
}
]
};

