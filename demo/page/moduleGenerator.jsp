<%@ page language="java" import="java.io.*"%><%
response.setHeader("Content-Type","application/json");
String json=request.getParameter("src");
String sleepTime=request.getParameter("sleep");
if(null!=sleepTime){
    Thread.sleep(Long.valueOf(sleepTime));
}   
BufferedReader bfr=null;
System.out.println("["+new java.util.Date()+"]");
try{
	bfr=new BufferedReader(request.getReader());
	String line;
	while(null!=(line=bfr.readLine())){
		System.out.println(line);
	}
}finally{
	if(null!=bfr){
		bfr.close();
	}
}

String lang;
lang=request.getParameter("lang");
if(null==lang){
    lang=request.getHeader("Accept-Language");
    int pos=lang.indexOf(",");
    if(-1!=pos){
        lang=lang.substring(0,lang.indexOf(","));
    }
    lang=lang.replace("-","_");
}
//response.setHeader("X-Locale",lang);
response.setHeader("X-JS","module/UpdateRegInfoStatic");
response.setHeader("X-Screen","UpdateRegInfo.htm");
response.setHeader("X-CSS","form.css;jsdp.css");
response.setHeader("X-Resources","res/demo-basic;res/demo-explain");
response.setHeader("X-MetaData-URL","handler.jsp?src=metaData.json");
request.getRequestDispatcher(json).include(request,response);
%>