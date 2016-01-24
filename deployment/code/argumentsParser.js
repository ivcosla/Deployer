
// inSockets and outSockets are the input and output socket
// of a given channel or component
function convertToChannelArguments(inSocket, outSockets, sType)
{
    // Assuming rand lb channel
    var res='';
    res += sType+' ';
    // Now only one input socket, but for statement anyways.
    res += inSocket + ' ';
    
    // First loop iterates througth components, to retrieve the name
    // of the host. Second loop througth endpoints, to retrieve ports
    for (var comp in outSockets)
    {
        res+= comp +' ';
        res+= outSockets[comp]+' ';
    }
    return res;   
}

function convertToComponentArguments(inSockets, outSockets)
{   
    var res='';
    for (var ep in inSockets)
    {
        res+=inSockets[ep]+' ';        
    }        
    
    for (var comp in outSockets)
    {
        res+=comp+' ';
        for (var ep in outSockets[comp])
        {
            res+=outSockets[comp][ep];
        }    
    }
    return res;
}

module.exports = {
    convertToChannelArguments: convertToChannelArguments,
    convertToComponentArguments: convertToComponentArguments
}