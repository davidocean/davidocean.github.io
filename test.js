/**
 * @author David.Ocean
 */
// var dojoConfig = { parseOnLoad: true };
dojo.require("esri.dijit.Measurement");
        
        
	var map,dynamiclayer;
	var identifyTask,identifyParams;
	var measurement;
	dojo.ready(init);
	var kk;
	
function init(){
	//初始化地图
map = new esri.Map("map", {
          basemap: "satellite",
          center: [-83.275, 42.573],
          zoom: 18,
        });
        // dojo.connect(map,"onLoad",air_area);
   //初始化图层
   dynamiclayer= new esri.layers.ArcGISDynamicMapServiceLayer(
            "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/BloomfieldHillsMichigan/Parcels/MapServer");
           map.addLayer(dynamiclayer);
        
        // var visible=[0];
        // dynamiclayer.setVisibleLayers(visible);
        
        //设定 测量的的连接
        //This sample requires a proxy page to handle communications with the ArcGIS Server services. You will need to  
        //replace the url below with the location of a proxy on your machine. See the 'Using the proxy page' help topic 
        //for details on setting up a proxy page.
        // esri.config.defaults.io.proxyUrl = "/proxy";
        // esri.config.defaults.io.alwaysUseProxy = false;
//         
        // //This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications
        // esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
      
        
        
        
        //测量的控件
        measurement = new esri.dijit.Measurement({
          map: map
        }, dojo.byId("measurementDiv"));
        // measurement.showTool("distance");
        // measurement.hideTool("distance");
        console.log("measurement,onclick");
        dojo.connect(measurement,"onClick",initMeasure);
        
      
        
        
//对identifytask任务以及参数进行设定
		identifyTask = new esri.tasks.IdentifyTask("http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/BloomfieldHillsMichigan/Parcels/MapServer");
		identifyParams = new esri.tasks.IdentifyParameters();
		identifyParams.tolerance = 3;
		identifyParams.returnGeometry = true;
		identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
		identifyParams.width  = map.width;
		identifyParams.height = map.height;
}

//对于measurementDive的操作
function initMeasure(){
	// measurement.startup();
	console.log("mmmmm");
	map.infoWindow.hide();
	 dojo.disconnect(kk);
	
}


//点击 空管区 按钮
function air_area(){
	
	dynamiclayer.setVisibleLayers([0]);
	identify_function(0);
}
//点击 飞机场 按钮
function air_port(){
	dynamiclayer.setVisibleLayers([1]);
	identify_function(1);
}
//点击 航线 按钮
function air_line(){
	dynamiclayer.setVisibleLayers([2]);
	identify_function(2);
}

function identify_function(number){
	//设定 弹出框隐藏
	map.infoWindow.hide();
	
	kk=dojo.connect(map,"onClick",executeIdentigyTask);
	
	console.log("dojo.conncet(onclick)");
	
       //将对应的参数传入
       identifyParams.layerIds=[number];
}

function executeIdentigyTask(evt){
	//点击的对应位置
	identifyParams.geometry = evt.mapPoint;
    identifyParams.mapExtent = map.extent;
	
	var deferred=identifyTask.execute(identifyParams);
	
	console.log("executeIdentigyTask");
	
	deferred.addCallback(function(response) {     
          // response is an array of identify result objects    
          // Let's return an array of features.
          return dojo.map(response, function(result) {
          	console.log("dojo.map(result)");
           
            var feature = result.feature;
            feature.attributes.layerName = result.layerName;
            if(result.layerName === 'Tax Parcels'){
              console.log(feature.attributes.PARCELID);
              var template = new esri.InfoTemplate("", "${Postal Address} <br/> Owner of record: ${First Owner Name}");
              feature.setInfoTemplate(template);
            }
            else if (result.layerName === 'Building Footprints'){
              var template = new esri.InfoTemplate("", "Parcel ID: ${PARCELID}");
              feature.setInfoTemplate(template);
            }
            return feature;
          });
        });
        map.infoWindow.setFeatures([ deferred ]);
        map.infoWindow.show(evt.mapPoint);
        
        
       
       
       }


//弹出框   测试用
function change(aaa){
	var str;
	for(var pp in aaa){
		str+=pp+": "+aaa[pp]+"\n";
	}
	alert(str);
}

function discon(){
	map.infoWindow.hide();
	 dojo.disconnect(kk);
	 // dojo.disconnect(map,"onClick",executeIdentigyTask);
}
 
