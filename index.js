
Ext.regModel('Links', {
        fields: ['name']
    });



// our callback function, let's fetch some nearby tweets:
function findme() {
	startPanel.setLoading('true','true');
	
  	var panel = new FindMePanel(startPanel);
 
  	navigator.geolocation.getCurrentPosition(function (position)
  	{
  		panel.setLocationAndFindStops(position);
  	});
  	
  	return panel;
}

var linksData = [
        {name: 'Find me...', handler: findme},
		{name: 'Find bus...'},
		{name: 'About...'}
    ];
var linksStore = new Ext.data.Store({model: 'Links',data: linksData});

var HomePanel = Ext.extend(Ext.Panel, 
	{
		layout: 'card',
		

	    constructor: function() {	
	    	this.currentPanel = {
	    		back: function(){
	    			return false;
	    		}
	    	}		
    		FindMePanel.superclass.constructor.call(this, 
    			{ 
					items: [
					{
						xtype: 'list',
						itemTpl: '{name}',
						store: linksStore,
						listeners: {
							itemtap: function(item,index)
								{
									var obj = linksStore.getAt(index).data;
									this.currentPanel = obj.handler();
									this.setActiveItem(this.currentPanel,'slide');
								},
							scope: this
						}
					}],
					dockedItems: [
					{
						xtype:'toolbar',
						dock: 'top',
						title: 'Next Bus?',
			
						items:[
							{
								text: 'Back',
								ui: 'back',
	
								handler: function(item,index)
									{
										if (!this.currentPanel.back())
										{
											javascript:location.reload(true);
										}
									},
								scope: this
								
							
							}
						],

					}]
					
					
    		});
    	}
	});




var startPanel;
function refreshpage(b,sender)
{
	location.reload(true);

}
		
Ext.setup({
    glossOnIcon: false,
    onReady: function() {
        startPanel = new Ext.Panel({
			
			layout:  'card',
			fullscreen: true,
        });
        
        startPanel.setActiveItem(new HomePanel());
    }
});