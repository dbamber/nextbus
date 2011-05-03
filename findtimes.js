function findTimes(stop,route)
{
  var query = "SELECT ?tlabel ?depart ?st  where {" +
				"?s a <http://transport.data.gov.uk/def/naptan/BusStopPoint> . " +
				"?s <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting> " + stop.East + " . " +
				"?s <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing> " + stop.North + " . " +
				"?st <http://vocab.org/transit/terms/stop> ?s . " + 
				"?st <http://vocab.org/transit/terms/trip> ?t . " +
				"?t <http://vocab.org/transit/terms/route> <" + route + "> . " +
				"?t <http://www.w3.org/2000/01/rdf-schema#label> ?tlabel . " +
				"?st <http://vocab.org/transit/terms/departureTime> ?depart ." +
				"FILTER(STR(?depart) > \"" + getTime(0) + "\") . " +
				"FILTER(STR(?depart) < \"" + getTime(2) + "\") " + 
				"} ";
	//alert(query);
	
	startPanel.setLoading(true);
	Ext.util.JSONP.request({
				url: 'http://jsonptunnel.appspot.com/',
                callbackKey: '_callback',
                params: {       
					extURL: 'http://linkedmanchester.org/sparql.json',             
                    _per_page: 100,
                    q: query
                },
                callback: function(result) {
					startPanel.setLoading(false);
					var results = result.results.bindings;
					
					var items = new Array();
					for (var i =0;i<result.results.bindings.length;i++)
					{
						alert(result.results.bindings[i].depart.value);
						items.push( { Depart: result.results.bindings[i].depart.value, Label: result.results.bindings[i].tlabel.value });
						
					}
                    //onBusStopRecieved(position.coords.latitude,position.coords.longitude,items);
                }
            });
}

function getTime(hoursDiff)
{
	var now = new Date();
	var hours = now.getHours() + hoursDiff;
	var minutes = now.getMinutes();
	

	var timeValue = (hours < 10) ? "0" + hours + "cunt" : hours+":";

	timeValue = timeValue + ((minutes < 10) ? "0" + minutes : minutes+"");
	return timeValue;
}
