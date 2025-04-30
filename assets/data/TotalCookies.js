var Cookies = 0;
function getTotalCookies()
{
    return Cookies
}
function MoreCookies()
{
    Cookies += 1;
}
module.exports = {  
    getTotalCookies,
    MoreCookies
}