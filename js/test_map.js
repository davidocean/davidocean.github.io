/**
 * @author David.Ocean
 */

var map;
var visibles=[];//控制图层是否显示
var air_url;//航空动态图层地址
var air_layer;//航空图层
var layer_flag;//图层标示
var map_click;//点击地图 进行 identify查询

require([
	"esri/map",
	"esri/geometry/Extent",
	"esri/layers/ArcGISDynamicMapServiceLayer",
	"esri/tasks/IdentifyTask",
	"esri/tasks/IdentifyParameters",
	
	"esri/geometry/Geometry",
	"esri/symbols/SimpleFillSymbol",
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/SimpleMarkerSymbol",
	
	"esri/layers/GraphicsLayer",
	"esri/graphic",
	"esri/renderers/SimpleRenderer",
	
	
	"dojo/on","dojo/dom"
],function(Map,Extent,ArcGISDynamicMapSercviceLayer,IdentifyTask,IdentifyParameters,
    Geometry,SimpleFillSymbol,SimpleLineSymbol,SimpleMarkerSymbol,GraphicsLayer,Graphic,
    SimpleRenderer,
    on ,dom){
	

	
	var fill_symbol;//简单的面symbol
    var line_symbol;//简单的线symbol
    var point_symbol;//简单的点symbol

    var identifyTask;
    var identifyParams;

    var fill_selectionLayer;//选择中的 面 GraphicLayer
    var fill_Renderer;//面 渲染器

    var line_selectionLayer;//选择中的 线GraphicLayer
    var line_Renderer;//线 渲染器

    var point_selectionLayer;//选择中的 点GraphicLayer
    var point_Renderer;//点 渲染器
	
	
	//定义初始的查看分为  中国范围
	var initextent=new Extent({
		"xmin":8176078.2376,
		"ymin":704818.0275,
		"xmax":1.50376858857E7,
		"ymax":7086873.4196,
		"spatialReference":{
			"wkid":102100
		}
	});
	//初始化地图 
	map=new Map("map",{
		logo:false,
		extent:initextent
	});
	
	
	/*
	该图层的信息：
	航空公司 (0)
	机场 (1)
	airport line (2)
	航空分区 (3)
	城市(4)
	省界 (5)
	*/
	
	air_url="http://portal.arcgiscloud.com:6080/arcgis/rest/services/air_lily/MapServer";
	air_layer=new ArcGISDynamicMapSercviceLayer(air_url);
	visibles=[4];
	air_layer.setVisibleLayers(visibles);
	layer_flag="region";
	
	//为fill_selectionlayer设定渲染器
	fill_selectionLayer=new GraphicsLayer();
	fill_Renderer=new SimpleRenderer(new SimpleFillSymbol());
	fill_selectionLayer.setRenderer(fill_Renderer);
	
	//为line_selectionLayer设定渲染器
	line_selectionLayer=new GraphicsLayer();
	line_Renderer=new SimpleRenderer(new SimpleLineSymbol());
	line_selectionLayer.setRenderer(line_Renderer);
	
	//为 point_selectionLayer 设定渲染器
	point_selectionLayer=new GraphicsLayer();
	point_Renderer=new SimpleRenderer(new SimpleMarkerSymbol());
	point_selectionLayer.setRenderer(point_Renderer);
	
	
	 //定义 添加到选择中的简单呢的 面要素，线要素和点要素
        fill_symbol=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
             new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                 new dojo.Color([25,250,20]),1),new dojo.Color([20,250,0,0.25]));
           console.log("fill_symbol");
        line_symbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new dojo.Color([0,255,0]),2);
        
        point_symbol=new SimpleMarkerSymbol(
            SimpleMarkerSymbol.STYLE_SQUARE,18,line_symbol,new dojo.Color([20,250,20])
        );   
	
	
	//为地图map添加图层
	map.addLayer(air_layer);
	map.addLayer(fill_selectionLayer);
	map.addLayer(line_selectionLayer);
	map.addLayer(point_selectionLayer);  
	
	
	
	//设定点击 查询
	var map_click=on(map,"click",doIdentify);
	
	
	
	//点击 tabs的时候，针对不同的按钮，将不同的图层进行展示。
   
    
	
	
	
	
	
	
	
	function clean_everything(){
	     //清除之前绘制的画面
        map.graphics.clear();
        fill_selectionLayer.clear();
        line_selectionLayer.clear();
        point_selectionLayer.clear();
	}
	
	  //进行 identify查询
    function doIdentify(event){
        clean_everything();//清除所有的graphic
        identifyTask=new IdentifyTask(air_url);
        identifyParams=new IdentifyParameters;
        
        identifyParams.layerOption=IdentifyParameters.LAYER_OPTION_ALL;
        identifyParams.tolerance=10;
        identifyParams.returnGeometry=true;
        identifyParams.width=map.width;
        identifyParams.height=map.height;
        
        var layerIds;//设定不同的id号
        switch(layer_flag){
            case "region":
                layerIds=[4];
                break;
            case "airport":
                layerIds=[1];
                break;
            case "airline":
                layerIds=[3];
                break;
            case "company":
                layerIds=[0];
                break;
        }
        identifyParams.layerIds=layerIds;
        
        identifyParams.geometry=event.mapPoint;
        identifyParams.mapExtent=map.extent;
        identifyTask.execute(identifyParams,showResults);
    }
    function showResults(results){
        var data={};
        var feature=results[0].feature;
        var geometry=feature.geometry;
        geometry.setSpatialReference(map.spatialReference);
        //打印results
        console.log(results);
        
        var geometryType=results[0].geometryType;
        console.log("geometrytype:"+geometryType);
      
             
            switch(geometryType){
                case "esriGeometryPolygon":
                    fill_selectionLayer.add(new Graphic(geometry,fill_symbol));
                    fill_selectionLayer.setVisibility(true);
                    //添加属性数据
                    data.type="hkfq";
                    data.name=feature.attributes.NAME;
                    data.code=feature.attributes.CODE;
                    break;
                    
                case "esriGeometryPolyline":
                console.log("polyline");
                    line_selectionLayer.add(new Graphic(geometry,line_symbol));
                    line_selectionLayer.setVisibility(true);
                    //添加属性数据
                    data.type="hx";
                    data.name=feature.attributes.NAME;
                    data.code=feature.attributes.CODE;
                    break;
                    
                    
                case "esriGeometryPoint":
                    point_selectionLayer.add(new Graphic(geometry,point_symbol));
                    point_selectionLayer.setVisibility(true);
                    //根据图层的不同，设定添加不同的属性数据
                    if(layer_flag=="airport"){
                        data.type="jc";
                        data.name=feature.attributes.NAME;
                        data.code=feature.attributes.CODE;
                        console.log("airport");
                    }else if(layer_flag=="company"){
                        data.type="hkgs";
                        data.name=feature.attributes.NAME;
                        data.code=feature.attributes.CODE;
                        console.log("company");
                    }
                    break;
            }
            //打印 data
            console.log(data);
    }
 
      changelayer = function(e){
                   clean_everything();
                       switch(e){
                           case region:
                              layer_flag="region";
                              visibles=[4];
                              air_layer.setVisibleLayers(visibles);
                              break;
                           
                           case airport:
                               layer_flag="airport";
                               visibles=[1,4,5];
                               air_layer.setVisibleLayers(visibles);
                               break;
                           
                           case airline:
                              layer_flag="airline";
                              visibles=[2,3,4,5];
                              air_layer.setVisibleLayers(visibles);
                              break;
                           
                           case company:
                              layer_flag="company";
                              visibles=[0,4,5];
                              air_layer.setVisibleLayers(visibles);
                              break;
                          }
              };
     
  


});

