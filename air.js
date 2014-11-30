/**
 * @author David.Ocean
 */
var dojoConfig = { parseOnLoad: true };

dojo.require("esri.map");
      dojo.require("esri.dijit.Popup");
      //添加 测量
      dojo.require("esri.dijit.Measurement");
      dojo.require("dijit.layout.BorderContainer");
      dojo.require("dijit.layout.ContentPane");
       dojo.require("esri.dijit.Scalebar");
       //添加按钮
        dojo.require("dijit.form.Button");

var map;
var identifyTask, identifyParams;
var landBaseLayer

function init() {
        //setup the popup window 
        var popup = new esri.dijit.Popup({
          fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25]))
        }, dojo.create("div"));
   
        map = new esri.Map("map", {
          basemap: "satellite",
          center: [-83.275, 42.573],
          zoom: 18,
          infoWindow: popup
        });
        

 dojo.connect(map, "onLoad", mapReady);
        
         landBaseLayer = new esri.layers.ArcGISDynamicMapServiceLayer(
            "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/BloomfieldHillsMichigan/Parcels/MapServer"
            ,{opacity:.55});
        map.addLayer(landBaseLayer);
        


 //设定 测量的的连接
        //This sample requires a proxy page to handle communications with the ArcGIS Server services. You will need to  
        //replace the url below with the location of a proxy on your machine. See the 'Using the proxy page' help topic 
        //for details on setting up a proxy page.
        esri.config.defaults.io.proxyUrl = "/proxy";
        esri.config.defaults.io.alwaysUseProxy = false;
        
        //This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications
        esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
      
      
        
        //测量按钮
       var measurement = new esri.dijit.Measurement({
          map: map
        }, dojo.byId("measurementDiv"));
        measurement.startup();
      
      }
      
      function mapReady(map){
       dojo.connect(map,"onClick",executeIdentifyTask);
       //create identify tasks and setup parameters 
       identifyTask = new esri.tasks.IdentifyTask("http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/BloomfieldHillsMichigan/Parcels/MapServer");
       
       identifyParams = new esri.tasks.IdentifyParameters();
       identifyParams.tolerance = 3;
       identifyParams.returnGeometry = true;
       identifyParams.layerIds = [0,2];
       identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
       identifyParams.width  = map.width;
       identifyParams.height = map.height;
      }
      
      function executeIdentifyTask(evt) {
        identifyParams.geometry = evt.mapPoint;
        identifyParams.mapExtent = map.extent;
       
        var deferred = identifyTask.execute(identifyParams);

        deferred.addCallback(function(response) {     
          // response is an array of identify result objects    
          // Let's return an array of features.
          return dojo.map(response, function(result) {
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

      
        // InfoWindow expects an array of features from each deferred
        // object that you pass. If the response from the task execution 
        // above is not an array of features, then you need to add a callback
        // like the one above to post-process the response and return an
        // array of features.
        map.infoWindow.setFeatures([ deferred ]);
        map.infoWindow.show(evt.mapPoint);
      }
      
      dojo.ready(init);
      
      //按钮的方法
      function air_control(){
         // dojo.connect(map,"onClick",executeIdentifyTask);
       // //create identify tasks and setup parameters 
       // identifyTask = new esri.tasks.IdentifyTask("http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/BloomfieldHillsMichigan/Parcels/MapServer");
//        
       // identifyParams = new esri.tasks.IdentifyParameters();
       // identifyParams.tolerance = 3;
       // identifyParams.returnGeometry = true;
       // identifyParams.layerIds = [0];
       // identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
       // identifyParams.width  = map.width;
       // identifyParams.height = map.height;
       // landBaseLayer.get
       
       
      }
      
      function air_port(){
      	var visible=new Array(1);
      	// visible.push(0);
      	visible[0]=0;
      	landBaseLayer.setVisibleLayers(visible);
      }
      function air_line(){
      	var visible=new Array(1);
      	// visible.push(2);
      	visible[0]=2;
      	landBaseLayer.setVisibleLayers(visible);
      }

