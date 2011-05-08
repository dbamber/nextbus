
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
        {name: 'Find me...', handler: findme}
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
	    	};
	    			
    		FindMePanel.superclass.constructor.call(this, 
    			{ 
    				items:[
    				{
    					layout: {type: 'vbox',align: 'left'},
						items: [
						{
							styleHtmlContent: true,
							html: '<p>Welcome to NextBus - Manchester. You can use this site to find out the next scheduled bus from your local stop!   </p>' +
									'<p>Developed for <a href="http://lovelydata.wordpress.com/">LovelyData</a> hackdays. Made possible by the great work done by <a href="http://www.swirrl.com/">swirrl</a> and <a href="http://linkedmanchester.org">Linked Manchester</a>. Many Thanks!</p>' +
									'<p>Please bookmark us! Select from below to begin!</p>'
						},
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
						}]
					}],
					
					dockedItems: [
					{
						xtype:'toolbar',
						dock: 'top',
						title: 'Next Bus? (Manchester)',
			
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