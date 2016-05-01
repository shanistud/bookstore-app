var _getApplicationSecret = function()
{
	//temp solution, should be saved as env var
	return "MY_APP_SECRET";
};


//global config settings
module.exports = 
{
  getApplicationSecret: _getApplicationSecret
};