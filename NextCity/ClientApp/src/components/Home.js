import React, { useState, useEffect, Component } from 'react';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Cluster, OSM, Vector as VectorSource} from 'ol/source.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Overlay from 'ol/Overlay.js';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style';
import Select from 'ol/interaction/Select.js';

import UserRequestModal from './UserRequestModal'
import {EPSG3857_X_MIN, EPSG3857_Y_MIN, EPSG3857_X_MAX, EPSG3857_Y_MAX} from './constants'
import {useAuth0} from "../react-auth0-wrapper"

import './Home.css'
import 'ol/ol.css';
import { runInThisContext } from 'vm';


var map
var clustersLayer
var overlay

const Home = () => {
  const [isUserRequestFromShown, setIsUserRequestFromShown] = useState(false)
  const [isNewUserRequest,setIsNewUserRequest] = useState(true)
  const [userName, setUserName] = useState('')
  const [userTel, setUserTel] = useState('')
  const [requestHeader, setRequestHeader] = useState('')
  const [requestBody, setRequestBody] = useState('')
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [userRequests, setUserRequests] = useState([])
    
  



  const updateOverlays = () => {     
    
    map.removeLayer(clustersLayer)

    const urFeatures = []
    for (let i = 0; i < userRequests.length; ++i){
      const ur = userRequests[i]
      const coordinates = [ur.x, ur.y]
      const feature = new Feature(new Point(coordinates))
      feature.setId(ur.id)    
      urFeatures.push(feature) 
    }
    const source = new VectorSource({
      features:urFeatures
    })
    const clusterSource = new Cluster({
      distance:40,
      source:source
    })

    var styleCache = {};
    clustersLayer = new VectorLayer({
      source: clusterSource,
      style: function(feature) {
        var size = feature.get('features').length;
        var style = styleCache[size];
        if (!style) {
          style = new Style({
            image: new CircleStyle({
              radius: 10,
              stroke: new Stroke({
                color: '#fff'
              }),
              fill: new Fill({
                color: '#3399CC'
              })
            }),
            text: new Text({
              text: size.toString(),
              fill: new Fill({
                color: '#fff'
              })
            })
          });
          styleCache[size] = style;
        }
        return style;
      }
    });
    
    map.addLayer(clustersLayer)
    
  }   

  const fetchData = () => 
    fetch('api/UserRequest/GetUserRequests')
          .then(response => response.json())
          .then(data => {
              console.log('data',data)
              setUserRequests(data);  
              setUserName('qqq')

              updateOverlays()   
          })
          // .then(() => {      
          //   console.log('userName', userName)
          //   console.log('userRequests',userRequests)               
                     
          // })          
  

  
  
  
  
  
  

  const toggle = () => {
    setIsUserRequestFromShown(prevState => !prevState)     
    
  }

  const handleMapClick = (coordinate) => {
    setIsUserRequestFromShown(true)
    setUserName('')
    setUserTel('')
    setRequestHeader('')
    setRequestBody('')
    setX(coordinate[0])
    setY(coordinate[1])
    setIsNewUserRequest(true)    
  }


  const addUserRequest = (userName, userTel, requestHeader, requestBody, x, y) => {
    if (userName && userTel && requestHeader && requestBody){
      const urVm = JSON.stringify({
        UserName:userName, 
        UserTel:userTel, 
        RequestHeader:requestHeader, 
        RequestBody:requestBody, 
        X:x, 
        Y:y})      
      fetch('api/UserRequest/AddUserRequest', {
        method:'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body:urVm
      }).then((response) => {
        if (response.ok){
          
          fetchData()
          alert('Заявка успешно добавлена')
        }else{
          alert('Ошибка добавления заявки')
        }
      }).catch(ex => {
        alert(ex)
      })
      toggle()
    }
    else{
      alert('Необходимо заполнить все поля')
    }
  }

  const handleSubmit = () => {   
    
    addUserRequest(userName, userTel, requestHeader, requestBody, x, y)    
  }

  

  useEffect(() => {
    
    let container = document.getElementById('popup');   
    var content = document.getElementById('popup-content');
    let closer = document.getElementById('popup-closer');

    /**
     * Create an overlay to anchor the popup to the map.
     */
    overlay = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });

    /**
     * Add a click handler to hide the popup.
     * @return {boolean} Don't follow the href.
     */
    closer.onclick = function() {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };


    clustersLayer = new VectorLayer({})
    map = new Map({        
      layers: [
          new TileLayer({
              source: new OSM()
          }),
          clustersLayer
      ],               
      overlays:[overlay],
      target: 'map-container',
      view: new View({
          center:[0,0],
          zoom:2
      })
    }); 
    
    

    //const context = this    

    map.on('click', function(evt) {   
     
      let coordinate = evt.coordinate
      let featuresCount = 0
      map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
        // if (!this.isAuthenticated){
        //   content.innerText = "Необходима авторизация для просмотра заявок."
        //   overlay.setPosition(coordinate)
        //   return
        // }

        featuresCount++
        const innerFeatures = feature.getProperties().features
        if (innerFeatures.length > 1){
          content.innerText = "В выбранную область попадает несколько заявок. Приблизьтесь и выберете одну зявку."
          overlay.setPosition(coordinate)
        }else{
          const id = innerFeatures[0].getId()          
          fetch(`api/UserRequest/GetUserRequest/${id}`)
          .then(response => response.json())
          .then(data => {
            setUserName(data.userName)
            setUserTel(data.userTel)
            setRequestHeader(data.requestHeader)
            setRequestBody(data.requestBody)
            setIsUserRequestFromShown(true)
            setIsNewUserRequest(false)              
          });      
        }        
      })
      
      if (featuresCount === 0){
        const x = coordinate[0]
        const correctX = x > 0 ? x % EPSG3857_X_MAX : x % EPSG3857_X_MIN
        const y = coordinate[1]
        const correctY = y > 0 ? y % EPSG3857_Y_MAX : y % EPSG3857_Y_MIN
        handleMapClick([correctX, correctY])    
      }      
    })

    map.on("pointermove", function (evt) {
        var hit = this.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            return true;
        }); 
        if (hit) {
            this.getTargetElement().style.cursor = 'pointer';
        } else {
            this.getTargetElement().style.cursor = '';
        }
    })
    console.log('fetch')
    fetchData()
  }, [])

  
  return (
    <div id='component-root'>  
      <UserRequestModal 
        isUserRequestFromShown={isUserRequestFromShown} 
        userName={userName} 
        setUserName = {setUserName}
        userTel={userTel} 
        setUserTel={setUserTel}
        requestHeader={requestHeader}  
        setRequestHeader={setRequestHeader}
        requestBody={requestBody}  
        setRequestBody = {setRequestBody}
        toggle={toggle}         
        handleSubmit={handleSubmit} 
        isNewUserRequest={isNewUserRequest}
      />
      <div id='map-container'></div>
      <div id="popup" className="ol-popup">
        <a href="#" id="popup-closer" className="ol-popup-closer"></a>
        <div id="popup-content"></div>
      </div>                      
    </div>
  );
  
}

export {Home}

