"use strict";

var React = require('react');

var getColor = require('../js/getColor');
var Calendar = require('./calendar');
var opening_hours = require('opening_hours');
var moment = require('moment');
var momentTZ = require('moment-timezone');

var NotEmpty = function(field){
	if(field === undefined) return false;
	if(field === null) return false;
	if(field === '') return false;
	return true;
}

function fromUTC(str){

    var tmp = str.split('T');
    var vDate = tmp[0].split('-');
    var vTime = tmp[1].split(':');

    var yyyy = parseInt(vDate[0]);
    var MM = parseInt(vDate[1]);
    var dd = parseInt(vDate[2]);
    var hh = parseInt(vTime[0]);
    var mm = parseInt(vTime[1]);
    var ss = parseInt(vTime[2]);

    return new Date(Date.UTC(yyyy,MM-1,dd,hh,mm,ss));
}

module.exports = React.createClass({
	render: function() {

    	var place = this.props.place;
		var id = place.id;
		
	 	// OPENING HOURS
	 	var oh = place.opening_hours === null ? undefined :
            	new opening_hours(place.opening_hours);
        var now = momentTZ().tz('Europe/Paris').toDate();
        //console.log(now);
        //var now = fromUTC(momentTZ().tz('Europe/Paris').format());
 
 		var isOpen = oh ? oh.getState(now) : true;

		// COLOR
		var color = "grey";
		if (place.measures && place.measures.latest && isOpen)
   		   color = getColor(place.measures.latest.latest, 0, place.measures.latest.max);

		// TITLE
		var title = place.name.replace("Déchèterie de ", "");
		title = title.replace("Déchèterie d'", "");

		// DISTANCE
		var distance = place.distance || '';
		if(distance !== '')
			distance = distance < 1000 ? Math.round(distance).toString()+' m - ' : (distance/1000).toFixed(2)+' km -';

		// ADDRESS
		var coordinatesJSX = [];
        if(NotEmpty(place.address_1)){
            coordinatesJSX.push(<span>{place.address_1}</span>);
            coordinatesJSX.push(<br/>);
        }
        if(NotEmpty(place.address_2)){
            coordinatesJSX.push(<span>{place.address_2}</span>);
            coordinatesJSX.push(<br/>);
        }
        if(NotEmpty(place.phone)){
            coordinatesJSX.push(<span><abbr title="phone">T:</abbr> {place.phone}</span>);
            coordinatesJSX.push(<br/>);
        }
        if(coordinatesJSX.length === 0){
            coordinatesJSX.push(<span><em>Pas de coordonnées indiquées</em></span>);
            coordinatesJSX.push(<br/>);
        }
        
        coordinatesJSX.push(<a id={'pos-'+id} className="map-url" href={"http://maps.apple.com/?q="
			+place.lat+","+place.lon}><em>ouvrir le plan</em></a>);
        coordinatesJSX.push(<br/>);

		if(NotEmpty(place.opening_hours)){
			coordinatesJSX.push(<br/>);
	        coordinatesJSX.push(<Calendar opening_hours={place.opening_hours} />);
		}

        coordinatesJSX.push(<br/>);
        coordinatesJSX.push(<span>Particuliers: <em>{place.public_access ? "oui" : "non"}</em></span>);
        coordinatesJSX.push(<br/>);
        coordinatesJSX.push(<span>Professionnels: <em>{place.pro_access ? "oui" : "non"}</em></span>);
        coordinatesJSX.push(<br/>);
        
        /*coordinatesJSX.push(<br/>);
        coordinatesJSX.push(<span>Gestionnaire: {place.operator}</span>);*/
		
		// BINS
		var binsJSX = "";
		if(NotEmpty(place.bins))
        {
        	binsJSX = place.bins
            .map(function(bin, num){
                return (<li key={'bin'+id+num} className={bin.a ? "border-open":"border-closed"}>{bin.t}</li>);
            });
        }

        // Adapt the height of panels to number of lines to display in charts
		var heightPanel = 40 + (place.results ? Object.keys(place.results).length * 22 : 40);
        var stylePanel = {'height': heightPanel.toString()+'px'};
        
        var chartJSX = place.pheromon_id ? 
        	(<div id={'panel-canvas-'+id} className="panel" style={stylePanel}>
				<div id={'chart-'+id} className="chart"/>
				<div id={'data-'+id} className="data">
					{JSON.stringify(place.results)}
				</div>
			</div> ) :  
			(<p className="disclaimer"><em>Ce centre n&apos;est pas équipé de capteur pour mesurer l&apos;affluence et le niveau des bennes.</em></p>);
	



		return (
			<div id={id} className="place">
				<ul className="place-header">
					<li><span className="place-avatar" style={{"backgroundColor": color}}></span></li>
					<li><span className="place-title">{title}<br/>
							<span className="place-subtitle">        
								<label className={isOpen?"open":"closed"}>{distance} {isOpen?"Ouvert":"Fermé"}</label>
							</span>
						</span>
					</li>
					<ul style={{"float":"right","listStyleType":"none", "padding": "0"}}>
						<li><button id={'register-'+id} className="place-no-favorite"><img src='../img/no-favorite.svg'/></button></li>
					</ul>
				</ul>
				<div id={'panel-infos-'+id} className="panel">
					<div className="coordinates">
						<div id={'map-'+id} className="map-box"/>
						<div className="details">
							{coordinatesJSX}
						</div>
					</div>
				</div>
				{chartJSX}
				<ul className="bins">
					{binsJSX}
				</ul>				
			</div>);
	}
});