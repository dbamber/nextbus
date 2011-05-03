
Ext.regModel('Links', {
        fields: ['name']
    });

var linksData = [
        {name: 'Find me...', handler: findme},
		{name: 'Find bus...'},
		{name: 'About...'}
    ];
var linksStore = new Ext.data.Store({model: 'Links',data: linksData});

var homePanel = new Ext.Panel({
	layout: 'fit',
	items: [
	{
		xtype: 'list',
		itemTpl: '{name}',
		store: linksStore,
		onItemTap: function(item,index)
		{
			var obj = linksStore.getAt(index).data;
			obj.handler();
		}
	}
	]
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
			
            items: [ homePanel ],
			dockedItems: [
				{
					xtype:'toolbar',
					dock: 'top',
					title: 'Next Bus?',
					
					items: [
							{
								text: 'Restart',
								handler: refreshpage
							}
						]
				}]
        });
    }
});