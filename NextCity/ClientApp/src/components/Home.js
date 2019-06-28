import React, { Component } from 'react';
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



export class Home extends Component {

  constructor(props){
    super(props)
    this.state = {
      isUserRequestFromShown:false,
      isNewUserRequest:true,
      userName:'',
      userTel:'',
      requestHeader:'',
      requestBody:'',
      X:0,
      Y:0,
      userRequests:[]      
    }
    this.toggle = this.toggle.bind(this)
    this.handleMapClick = this.handleMapClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.fetchData = this.fetchData.bind(this)   
    this.updateOverlays = this.updateOverlays.bind(this) 
    
  }    


  fetchData(){
    fetch('api/UserRequest/GetUserRequests')
          .then(response => response.json())
          .then(data => {
              this.setState({ userRequests: data }, () =>  {this.updateOverlays()});  
          })
          
  }
  
  
  componentDidMount() {    
      
    let container = document.getElementById('popup');   
    var content = document.getElementById('popup-content');
    let closer = document.getElementById('popup-closer');

    /**
     * Create an overlay to anchor the popup to the map.
     */
    let overlay = new Overlay({
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


    this.clustersLayer = new VectorLayer({})
    let map = new Map({        
      layers: [
          new TileLayer({
              source: new OSM()
          }),
          this.clustersLayer
      ],               
      overlays:[overlay],
      target: 'map-container',
      view: new View({
          center:[0,0],
          zoom:2
      })
    });  

    const context = this    

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
            context.setState({
              userName:data.userName, 
              userTel:data.userTel, 
              requestHeader:data.requestHeader, 
              requestBody:data.requestBody, 
              isUserRequestFromShown:true,
              isNewUserRequest:false
            })            
          });      
        }        
      })
      
      if (featuresCount === 0){
        const x = coordinate[0]
        const correctX = x > 0 ? x % EPSG3857_X_MAX : x % EPSG3857_X_MIN
        const y = coordinate[1]
        const correctY = y > 0 ? y % EPSG3857_Y_MAX : y % EPSG3857_Y_MIN
        context.handleMapClick([correctX, correctY])    
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

    this.map = map
    this.overlay = overlay    
    this.fetchData()
  }

  updateOverlays(){ 

    this.map.removeLayer(this.clustersLayer)

    const urFeatures = []
    for (let i = 0; i < this.state.userRequests.length; ++i){
      const ur = this.state.userRequests[i]
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
    this.clustersLayer = new VectorLayer({
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
    
    this.map.addLayer(this.clustersLayer)
    //console.log(this.map.getLayers())


    // this.map.getOverlays().clear()
    // for (let i = 0; i < this.state.userRequests.length; ++i){
    //   let ur = this.state.userRequests[i]          
   
    //   let root = document.getElementById('component-root')
      
    //   let popup = document.createElement('div')
    //   popup.classList.add('ol-popup')
    //   popup.onclick = () => {
    //     fetch(`api/UserRequest/GetUserRequest/${ur.id}`)
    //       .then(response => response.json())
    //       .then(data => {
    //         this.setState({
    //           userName:data.userName, 
    //           userTel:data.userTel, 
    //           requestHeader:data.requestHeader, 
    //           requestBody:data.requestBody, 
    //           isUserRequestFromShown:true,
    //           isNewUserRequest:false
    //         })            
    //       });        
    //   } 
      
    //   let popupContent = document.createElement('div')
    //   popupContent.innerHTML = '<div><code>' + ur.requestHeader +'</code></div>'

    //   popup.appendChild(popupContent)        
    //   root.appendChild(popup)
     
    //   var overlay = new Overlay({
    //     element: popup,
    //     autoPan: true,
    //     autoPanAnimation: {
    //       duration: 250
    //     }
    //   });
    //   overlay.setPosition([ur.x, ur.y]);
    //   this.map.addOverlay(overlay)     
     
    // }
  }  

  // handlePopupClick(ev){
  //   console.dir
  // }
  

  toggle(){
    this.setState(prevState => ({
      isUserRequestFromShown: !prevState.isUserRequestFromShown
    }))        
  }

  handleMapClick(coordinate){
    this.setState({isUserRequestFromShown:true, userName:'', userTel:'', requestHeader:'', requestBody:'', X:coordinate[0], Y:coordinate[1], isNewUserRequest:true})
  }

  handleChange(event){
      const {name, value} = event.target
      this.setState({[name]:value})
  }

  handleSubmit(){   
    this.addUserRequest(this.state.userName, this.state.userTel, this.state.requestHeader, this.state.requestBody, this.state.X, this.state.Y)    
  }

  addUserRequest(userName, userTel, requestHeader, requestBody, x, y){
    if (userName && userTel && requestHeader && requestBody){
      const urVm = JSON.stringify({UserName:userName, UserTel:userTel, RequestHeader:requestHeader, RequestBody:requestBody, X:x, Y:y})      
      fetch('api/UserRequest/AddUserRequest', {
        method:'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body:urVm
      }).then((response) => {
        if (response.ok){
          this.fetchData()
          alert('Заявка успешно добавлена')
        }else{
          alert('Ошибка добавления заявки')
        }
      }).catch(ex => {
        alert(ex)
      })
      this.toggle()
    }
    else{
      alert('Необходимо заполнить все поля')
    }
  }


  render () {
    return (
      <div id='component-root'>  
        <UserRequestModal 
          isUserRequestFromShown={this.state.isUserRequestFromShown} 
          userName={this.state.userName} 
          userTel={this.state.userTel} 
          requestHeader={this.state.requestHeader} 
          requestBody={this.state.requestBody} 
          toggle={this.toggle} 
          handleChange={this.handleChange} 
          handleSubmit={this.handleSubmit} 
          isNewUserRequest={this.state.isNewUserRequest}
        />
        <div id='map-container'></div>
        <div id="popup" className="ol-popup">
          <a href="#" id="popup-closer" className="ol-popup-closer"></a>
          <div id="popup-content"></div>
        </div>                      
      </div>
    );
  }
}
