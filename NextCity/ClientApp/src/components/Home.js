import React, { Component } from 'react';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Overlay from 'ol/Overlay.js';

import UserRequestModal from './UserRequestModal'

import './Home.css'
import 'ol/ol.css';



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
              this.setState({ userRequests: data });    
              this.updateOverlays()          
          });
  }
  
  
  componentDidMount() {    
      
    // const vectorSource = new VectorSource({
    //   features: []
    // });    
    // const vectorLayer = new VectorLayer({
    //     source: vectorSource ,            
    // });   

    this.map = new Map({        
      layers: [
          new TileLayer({
              source: new OSM()
          })
      ],               
      overlays:[],
      target: 'map-container',
      view: new View({
          center:[0,0],
          zoom:2
      })
    }); 

    const context = this

    this.map.on('singleclick', function(evt) {    
      context.handleMapClick(evt.coordinate)    
    });

    this.fetchData()
  }

  updateOverlays(){ 
    //console.log('update-overlays')  
    //this.map.getOverlays().clear()
    // for (let i = 0; i < this.state.userRequests.length; ++i){
    //     let ur = this.state.userRequests[i]
    //     let element = document.getElementById(`popup-${ur.id}`)
    //     //console.log(element)
        
    //     let overlay = new Overlay({
    //       element: element,
    //       autoPan: false,
    //       // autoPanAnimation: {
    //       //   duration: 250
    //       // }
    //     });
    //     overlay.setPosition([ur.x, ur.y]);
    //     this.map.addOverlay(overlay) 
    // }    
    // console.log(this.map.getOverlays())

    this.map.getOverlays().clear()
    for (let i = 0; i < this.state.userRequests.length; ++i){
      let ur = this.state.userRequests[i]          
   
      let root = document.getElementById('component-root')
      
      let popup = document.createElement('div')
      popup.classList.add('ol-popup')
      popup.onclick = () => {
        fetch(`api/UserRequest/GetUserRequest/${ur.id}`)
          .then(response => response.json())
          .then(data => {
            this.setState({
              userName:data.userName, 
              userTel:data.userTel, 
              requestHeader:data.requestHeader, 
              requestBody:data.requestBody, 
              isUserRequestFromShown:true,
              isNewUserRequest:false
            })            
          });        
      } 
      
      let popupContent = document.createElement('div')
      popupContent.innerHTML = '<div><code>' + ur.requestHeader +'</code></div>'

      popup.appendChild(popupContent)        
      root.appendChild(popup)
     
      var overlay = new Overlay({
        element: popup,
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        }
      });
      overlay.setPosition([ur.x, ur.y]);
      this.map.addOverlay(overlay)     
     
    }
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
      </div>
    );
  }
}
