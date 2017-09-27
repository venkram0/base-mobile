angular.module('starter.controllers')
.controller('mapController', ['$scope', '$state', '$ionicPopup', '$window', '$rootScope', '$cordovaGeolocation', '$http', '$ionicLoading', 'leafletData', '$timeout', 'config', 'commonService', '$localstorage', 'mapService', 'alertService', 'strings', '$ionicModal', function ($scope, $state, $ionicPopup, $window, $rootScope, $cordovaGeolocation, $http, $ionicLoading, leafletData, $timeout, config, commonService, $localstorage, mapService, alertService, strings, $ionicModal,$ionicListDelegate) {
//var taskHistoryController=	$controller('taskHistoryCtrl',{$scope: $scope});
			commonService.Loaderhide();
		 	var geocoder = new google.maps.Geocoder();
			$scope.navigationStatus = false;
			var _map;
			
			var cardedMarkers = new L.FeatureGroup();
			var nonCardedMarkers=new L.FeatureGroup();

			$scope.maprecordId = "";
			securityHeaders.headers = commonService.securityHeaders();

			leafletData.getMap().then(function (map) {
				_map = map;
				$(".leaflet-control-zoom").css("visibility", "hidden");
			});
			var layerControl = L.control.layers();
			$rootScope.autocomplete = false;
			$rootScope.searchIcon = true;
			$rootScope.clearIcon = false;
			$scope.mapImage = {};
			$scope.mapImage = "img/Map.png";
			$scope.navigatteTotask = function () {
				$state.transitionTo("app.taskforms");
			};

			$scope.init = function () {
				navigator.geolocation.clearWatch($scope.watchId);
				var height = $window.innerHeight;
				$scope.MapHeight = height; // leaves the header padding
				$scope.DivWid = $window.innerWidth;
				if ($rootScope.NavigatedFrom == "tasks" || $rootScope.NavigatedFrom == "jobs") {
					$scope.createTaskMarkers();
				}
				if ($rootScope.NavigatedFrom == "form") {}
				if ($rootScope.NavigatedFrom == "prepoprec") {
					$scope.createTaskMarkers();
				}
			};
			/*
			This funciton is used to make a marker, that is later added to the map
			1. prepare the message that should be displayed when clicked on a marker
			2. prepare the object that should be returned
			 */
			$scope.makeMarker = function (lat, lng, recid, formid) {
				return {
					lat : parseFloat(lat),
					lng : parseFloat(lng), 
					clickable : true,
					recid : recid,
					formid : formid

				};
			};
			
			function createMarkersProcess(geometer,record,formId,taskId,markerIcon,markerLayer,type){
					var customMarker = L.Marker.extend({});
				    var markerObject = new customMarker([ geometer.lat, geometer.long], {
				        recordId: record.recordId,
				        icon: markerIcon,
				        FormId:formId,
				        TaskId:taskId
				    });
				    if ($rootScope.NavigatedFrom == "prepoprec") {
							angular.forEach($scope.tasklist, function (record, key) { 
								console.log("yessssssss");
							   if (record.recordId == $rootScope.navigatetoRecordId) {
									$rootScope.clickedLat = record.lat;
									$rootScope.clickedLng = record.long;
									$scope.maprecordId = record.recordId;
									$scope.navigateToLocation();
								}else{
									console.log("..............");
								}
							});	
							
					}else{
				    markerObject.on('click', function() {
				    	console.log("heyyyyyyyyyyyyyy");
				    	if(type){
				   			 $rootScope.ViewTaskFormRecord(markerObject.options);	
				    	}else{
 							$rootScope.getPrePoprecordFromMap(markerObject.options);
				    	}
				    })
				    markerObject.addTo(markerLayer);
				}
			}
			$scope.createTaskMarkers = function () {
				var taskId = localStorage.getItem("mapTaskid");
				var formId = localStorage.getItem("mapFormId");
				var user = $localstorage.getObject("username");
			var greenMarkerIcon = L.icon({iconUrl: 'img/green.png',
                           iconSize:     [50, 50], // size of the icon
                });
			var blueMarkerIcon = L.icon({iconUrl: 'img/blue.png',
                         iconSize:     [50, 50], // size of the icon
                });
				var url = config.url + "api/v1/formszDetails/getLatLongWIthForm/" + formId + "/" + taskId + "/" + user + "";
				mapService.getMapRecords(url, securityHeaders, function (response, status) {
					console.log(response);
					$scope.tasklist = [];
					if (response.status == 204) {
						alertService.doAlert(response.message);
					}
					if (response.status == 200) {
						angular.forEach(response.data.latlngData, function (value, key) {
							angular.forEach(value.records, function (record, key) {
								angular.forEach(record.geometries, function (geometer, key) {
									$scope.tasklist.push({lat:geometer.lat, long:geometer.long,recordId: record.recordId,formId: value.formId});
   								//	$scope.tasklist.push($scope.makeMarker(geometer.lat, geometer.long, record.recordId, value.formId)); 
					  		        if(record.status)
					  		        {
					  		        	createMarkersProcess(geometer,record,value.formId,taskId,greenMarkerIcon,cardedMarkers,true)
					  		      	}
					  		      	else
					  		      	{
			  		      				createMarkersProcess(geometer,record,value.formId,taskId,blueMarkerIcon,nonCardedMarkers,false)
					  		      		
					  		      	}
								});
							});
						});
						//add layers to map start
						if ($rootScope.NavigatedFrom == "tasks" || $rootScope.NavigatedFrom == "jobs") {
							_map.addLayer(cardedMarkers);
							_map.addLayer(nonCardedMarkers);
						
						}
					}
				});
			};	

			
			var activeLayersArray = [];
			angular.extend($scope, {
				center : {
					lat : $scope.tasklat,
					lng : $scope.tasklng,
					zoom : 25
				},
				legend : {
					position : 'bottomleft',
					colors : ['#167C9E', '#29C22E', '#DBD82C', '#D69318'],
					labels : []
				},
				controls : {
					scale : true
				},
				defaults : {
					maxZoom : 25,
					minZoom : 11,
					keyboard : true,
					worldCopyJump : true,
					dragging : true/*,
					tileLayer: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'*/
				}
				,layers : {
					baselayers : {
						osm : {
							name : 'OpenStreetMap',
							url : 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
							type : 'xyz',
							layerOptions : {
								showOnSelector : false
							}
						}
					}
				}
			}); //angular.extend loop ends here
			
			 var dataobj='{"layers": [{"tileset": "EPSG-900913","name": "SUPPLY_POINTS","version": "6979337926"},{"tileset": "EPSG-900913","name": "LV_NETWORK","version": "6979337926"}] }';
			//var dataobj = '{ "layers": [{ "tileset": "EPSG-900913", "name": "Transmission structures", "version": "6979337926" }, { "tileset": "EPSG-900913", "name": "Distribution structures", "version": "6979337926" }, { "tileset": "EPSG-900913", "name": "MV network", "version": "6979337926" }, { "tileset": "EPSG-900913", "name": "Internals", "version": "6979337926" }, { "tileset": "EPSG-900913", "name": "Areas", "version": "6979337926" }, { "tileset": "EPSG-900913", "name": "Design Boundaries", "version": "6979337926" }, { "tileset": "EPSG-900913", "name": "Transmission network", "version": "6979337926" }, { "tileset": "EPSG-900913", "name": "LV network", "version": "6979337926" }] }';
			dataobj = JSON.parse(dataobj);

			angular.forEach(dataobj.layers, function (value, key) {
				console.log("called this func");
	//		var tilelayer = new L.TileLayer.WMTS("http://wprntv001.domain.prd.int:98/maps" ,{
			var tilelayer = new L.TileLayer.WMTS("http://wprntv001.domain.prd.int:98/maps" ,{
						layer : value.name,
						style : "",
						tilematrixSet : value.tileset,
						format : "image/png",
						maxZoom : 25
					});
				layerControl.addOverlay(tilelayer, value.name);
			});
			leafletData.getMap().then(function (map) {
				L.control.scale({
					'position' : 'bottomleft',
					'metric' : true,
					'imperial' : false
				}).addTo(map);
				layerControl.addTo(map);
				map.on('overlayadd', onOverlayAdd);
				map.on('overlayremove', overlayRemove);
				
				map.on('zoomstart',function (e) { 
				  $timeout(function () {commonService.LoaderShow("Loading...");},0);
				});
                 map.on('zoomend',function (e) { 
				   $timeout(function () { commonService.Loaderhide();},1500);
				 });
				map.on('click', function (e) {
						
						getTileURL(e.latlng.lat, e.latlng.lng, map.getZoom())
					});
			});
			$scope.getlatlngfromaddress = function (lat, lng,addressText) {
				$scope.center = {
					lat : lat,
					lng : lng,
					zoom : 15
				};
				_map.getBounds(),
				this.ll = new L.LatLng(lat, lng),
				this.marker ? (this.marker.setLatLng(this.ll), this.marker.update()).bindPopup(addressText).openPopup() : this.marker = new L.Marker(this.ll, {
						icon : new L.Icon({
							iconUrl : "img/user-location.png",
							iconSize : [38, 38]
						}),
						clickable : !1
					}).addTo(_map);
				leafletData.getMap().then(function (map) {
					_map = map;
					cordova.plugins.Keyboard.close();
				});
				commonService.Loaderhide();
			};
			$scope.showFilterBar = function () {
				$rootScope.searchIcon = false;
				$rootScope.autocomplete = true;
				$rootScope.clearIcon = true;
				$scope.shouldBeOpen = true;
				cordova.plugins.Keyboard.show();
			};
			$scope.hideSearch = function () {
				$rootScope.clearIcon = false;
				$rootScope.autocomplete = false;
				$rootScope.searchIcon = true;
				$scope.shouldBeOpen = false;
				cordova.plugins.Keyboard.close();
			};
			$scope.disableTap = function () {
				var container = document.getElementsByClassName('pac-container');
				angular.element(container).attr('data-tap-disabled', 'true');
				var backdrop = document.getElementsByClassName('backdrop');
				angular.element(backdrop).attr('data-tap-disabled', 'true');
				angular.element(container).on("click", function () {
					document.getElementById('autocomplete').blur();
				});
			};
			/*
			This function is used to remove an overlay from the layers object
			1. Hide the overlay
			2. delete the object from the overlays object
			 */
			$scope.removeOverlay = function (layerName) {

				$scope.layers.overlays[layerName].visible = false;
				delete $scope.layers.overlays[layerName];
			};

			/*
			This function is used to add an overlay to the layers object
			1. prepare the options for the overlay
			2. add the object to the overlays object
			 */
			$scope.addOverlay = function (layerName, options) {

				options.name = layerName;
				options.visible = true;
				$scope.layers.overlays[layerName] = options;
			};

			
			$scope.removeMarkers = function () {
				$scope.markers = {};
			};
			$scope.backTorecords = function () {
				if ($scope.navigationStatus === false) {
					navigator.geolocation.clearWatch($scope.watchId);
					if ($rootScope.NavigatedFrom == "form") {
						$state.go("app.viewForm");
					}
					if ($rootScope.NavigatedFrom == "tasks") {
						$state.go("app.taskformhistory");
					}
					if ($rootScope.NavigatedFrom == "jobs") {
						$state.go("tabs.assignedtasks");
					}
					if ($rootScope.NavigatedFrom == "prepoprec") {
						$state.go("app.taskformhistory");
					}
				}
				if ($scope.navigationStatus === true) {
					// A confirm dialog
					var confirmPopup = $ionicPopup.confirm({
							title : 'Confirm',
							template : 'Are you sure you want to exit navigation?'
						});
					confirmPopup.then(function (res) {
						if (res) {
							navigator.geolocation.clearWatch($scope.watchId);
							if ($rootScope.NavigatedFrom == "form") {
								$state.go("app.viewForm");
							}
				         if ($rootScope.NavigatedFrom == "tasks" || $rootScope.NavigatedFrom == "jobs") {
								$state.go("tabs.assignedtasks");
							}
							if ($rootScope.NavigatedFrom == "prepoprec") {
								$state.go("app.taskformhistory");
							}
						} else {}
					});

				}

			};
			$scope.goTOCurrentLocation = function () {
				console.log("innnnnnnnnnnnnnnnnn");
				commonService.LoaderShow();
				commonService.getLatLong(function (geoLocation) {
					if (geoLocation.netstatus == "success") {
						$scope.lat = geoLocation.latlong[0];
						$scope.long = geoLocation.latlong[1];
	    var latlng = {lat: parseFloat($scope.lat), lng: parseFloat($scope.long)};
		geocoder.geocode({'location': latlng}, function(results, status) {

          if (status === 'OK') {
            var addressIn = results[0].formatted_address;
			$scope.getlatlngfromaddress($scope.lat, $scope.long,addressIn);          
           }
         });
					}
					if (geoLocation.netstatus == "error") {
						commonService.Loaderhide();
						alertService.showToast(geoLocation.message);
					}
				});

			};
			
			/*$scope.goTOJobLocation = function () {
				commonService.LoaderShow();
				leafletData.getMap().then(function (map) {
					_map = map;
					var group = new L.featureGroup($scope.arr);
					_map.fitBounds(group.getBounds());
				});
				commonService.Loaderhide();
			};*/

			$scope.navigateToLocation = function () {
				commonService.LoaderShow(strings.pleasewait);
				if ($scope.control) {
					_map.removeControl($scope.control);

				}
				commonService.getLatLong(function (geoLocation) {
					if (geoLocation.netstatus == "success") {
						$scope.lat = geoLocation.latlong[0];
						$scope.long = geoLocation.latlong[1];
						var waypoints = [
							L.latLng($scope.lat, $scope.long),
							L.latLng($rootScope.clickedLat, $rootScope.clickedLng)
						];
						$scope.control = L.Routing.control({
								plan : L.Routing.plan(waypoints, {
									createMarker : function (i, wp) {
									//	console.log(wp);
										var maplat=wp.latLng.lat;
										var maplng=wp.latLng.lng;
										return L.marker(wp.latLng, {
											draggable : false,
											icon : L.icon.glyph({
												glyphColor : 'red',
												glyph : String.fromCharCode(65 + i),
												bgSize : [800, 100]
											})
										}).on('click', function() {
							      		 	var url="http://maps.google.com?q="+maplat+","+maplng;
											window.open(url, "_system", 'location=yes');
										});
									},
								
								}),
								altLineOptions : {
									styles : [{
											color : 'black',
											opacity : 0.15,
											weight : 9
										}, {
											color : 'white',
											opacity : 0.8,
											weight : 6
										}, {
											color : 'blue',
											opacity : 0.5,
											weight : 2
										}
									]
								}
							})
							.addTo(_map);
						L.Routing.errorControl($scope.control).addTo(_map);
						$scope.navigationStatus = true;
						commonService.Loaderhide();
						$scope.gotToCurrentLocation();
					}
					if (geoLocation.netstatus == "error") {
						commonService.Loaderhide();
						alertService.showToast(geoLocation.message);
					}
				});
			};
			$scope.gotToCurrentLocation = function () {
				var that = this;
				var options = {
					enableHighAccuracy : true,
					timeout : 5000,
					maximumAge : 0
				};
				$scope.watchId = navigator.geolocation.watchPosition($scope.setUserLocation.bind(this), function () {
						alert("Could not Find the Position")
					}, {
						enableHighAccuracy : true,
						maximumAge : 0
					});
			}
		
			$scope.setUserLocation = function (pos) {
				console.log("markerrrrrrrrrrrr");
				_map.getBounds(),
				this.ll = new L.LatLng(pos.coords.latitude, pos.coords.longitude),
				this.marker ? (this.marker.setLatLng(this.ll), this.marker.update()) : this.marker = new L.Marker(this.ll, {
						icon : new L.Icon({
							iconUrl : "img/user-location.png",
							iconSize : [38, 38]
						}),
						clickable : !1
					//marker.on('click', onClick);
					}).addTo(_map),
				_map.getBounds().contains(this.ll) ? console.log("") : _map.panTo(this.ll);

			};
			/*********************************** Map Feature Info***************************************** */
			var x,
			y;
			function onOverlayAdd(e) {
				activeLayersArray.push(e.name);
			}

			function overlayRemove(e) {
				for (var i = activeLayersArray.length; i--; ) {
					if (activeLayersArray[i] === e.name) {
						activeLayersArray.splice(i, 1);
					}
				}
			}
			if (typeof(Number.prototype.toRad) === "undefined") {
				Number.prototype.toRad = function () {
					return this * Math.PI / 180;

				}
			}

			
			function getTileURL(lat, lon, zoom) {
				var xtile = parseInt(Math.floor((lon + 180) / 360 * (1 << zoom)));
				var ytile = parseInt(Math.floor((1 - Math.log(Math.tan(lat.toRad()) + 1 / Math.cos(lat.toRad())) / Math.PI) / 2 * (1 << zoom)));
				leafletData.getMap().then(function (map) {
					x = lonLatToPixelX(lon, lat, map);
					y = lonLatToPixelY(lon, lat, map);
				});
				currentTileXIndex = x - (xtile * 512);
				currentTileYIndex = y - (ytile * 512);
				var config = {};
				var infoData = [];
				var flag = 0;
				//var GET_MAP_TILES = "http://183.82.100.86:4002/gss/gssogc/ogc?SERVICE=WMTS&REQUEST=GetFeatureInfo&VERSION=1.0.0&LAYER=";
				//alert(activeLayersArray.length);
				// var GET_MAP_TILES= "http://wprntv001.domain.prd.int:98/maps?SERVICE=WMTS&REQUEST=GetFeatureInfo&VERSION=1.0.0&LAYER=";
						var GET_MAP_TILES= "http://wprntv001.domain.prd.int:98/maps?SERVICE=WMTS&REQUEST=GetFeatureInfo&VERSION=1.0.0&LAYER=";

				for (var i = 0; i < activeLayersArray.length; i++) {

					url = GET_MAP_TILES + activeLayersArray[i] + "&STYLE=&TILEMATRIXSET=EPSG-900913&TILEMATRIX=" + zoom + "&TILEROW=" + ytile + "&TILECOL=" + xtile + "&FORMAT=image%2Fpng&INFOFORMAT=application%2Fjson&I=" + parseInt(currentTileXIndex) + "&J=" + parseInt(currentTileYIndex);
					mapService.restGetType(url, config, function (status, res) {
						if (status) {
							if (res.data.features.length != 0) {
								commonService.LoaderShow();
								flag++;
								infoData.push(res.data.features);
							}

						} else {}
					});
				}

				$timeout(function () {
					if (flag > 0) {
						$rootScope.info = infoData;
						$ionicModal.fromTemplateUrl('templates/modal.html', {
							scope : $scope
						}).then(function (modal) {
							$scope.modal = modal;
							modal.show();
						});

					}
					flag = 0;
					commonService.Loaderhide();

				}, 3000);
			}

			function lonLatToPixelX(longitude, latitude, map) {
				// Clamp values
				MinLatitude = -85.05112878;
				MaxLatitude = 85.05112878;
				MinLongitude = -180;
				MaxLongitude = 180;
				longitude = clamp(longitude, MinLongitude, MaxLongitude);
				x = calcRatioX(longitude);
				mapSize = Math.pow(2, map.getZoom()) * 512;
				pixelX = clamp(x * mapSize + 0.5, 0, mapSize - 1);
				return pixelX;
			}

			function lonLatToPixelY(longitude, latitude, map) {
				// Clamp values
				MinLatitude = -85.05112878;
				MaxLatitude = 85.05112878;
				MinLongitude = -180;
				MaxLongitude = 180;
				latitude = clamp(latitude, MinLatitude, MaxLatitude);
				y = calcRatioY(latitude);
				mapSize = Math.pow(2, map.getZoom()) * 512;
				pixelY = clamp(y * mapSize + 0.5, 0, mapSize - 1);
				return pixelY;
			}

			function clamp(x, min, max) {
				return Math.min(Math.max(x, min), max);
			}

			function calcRatioX(longitude) {
				ratioX = ((longitude + 180.0) / 360.0);
				return ratioX;
			}

			function calcRatioY(latitude) {
				sinLatitude = Math.sin(latitude * Math.PI / 180.0);
				ratioY = (0.5 - Math.log((1 + sinLatitude) / (1.0 - sinLatitude)) / (4.0 * Math.PI));
				return ratioY;
			}

			var geocoder = new google.maps.Geocoder();

			function googleGeocoding(text, callResponse) {
				geocoder.geocode({
					address : text
				}, callResponse);
			}

			function formatJSON(rawjson) {
				var json = {},
				key,
				loc,
				disp = [];

				for (var i in rawjson) {
					key = rawjson[i].formatted_address;

					loc = L.latLng(rawjson[i].geometry.location.lat(), rawjson[i].geometry.location.lng());

					json[key] = loc; //key,value format
				}

				return json;
			}
			/*******************************************Map Feature info Ends*******************************************************************/
          $scope.createSelectionParams=function(lonlat,callback) {
            /*
            Method creates the params necessary for circular MBR in database.
            */

            lonlat = String(lonlat).split(",");
            var point = ol.proj.toLonLat([lonlat[0], lonlat[1]]);
            var n1 = 156250,
                o1 = n1 / Math.pow(2, map.getView().getZoom());
            var tol = null;
            var i = point[1] * (2 * Math.PI / 360),
                n = 111412.84,
                o = -93.5,
                r = .118,
                s = n * Math.cos(i) + o * Math.cos(3 * i) + r * Math.cos(5 * i);
            tol = 1 / s * (8 * o1);
            var params = {
                lng: point[0],
                lat: point[1],
                zoom: map.getView().getZoom(),
                tolerance: tol,
                xmin: point.lon - tol,
                xmax: point.lon + tol,
                ymin: point.lat - tol,
                ymax: point.lat + tol,
                layers: "",
                selectionType: 2
            };
            callback(params);

        }
	    $scope.init();

		}
	]);
