decj
====

ease your daily web frontend dev with declarative Javascript programming

decj is a lightweight Javascript framework. By taking advantages of JSON and AMD,it enables solving common issues elegantly
in the client-side web development in a declarative and modular way.Declarative programming means we can achieve the same 
thing or even more with less code compared with imperative programming.All features supported by the framework do NOT 
require you write imperative code,you just declare what you need to do.

[Advantages of decj]:
* Declarative Modular Programming:Enable developers concentrate on bussiness logic rather than technical issues.

 For example, to make a button respond to a click event, even with the jQuery library, one may need to write code like below:
 ```javascript
 //Invoke the ready method of a jQuery instance
 $(document).ready(function(){ //When the page is completely loaded, this function will be invoked.
  //Invoke the bind method of a jQuery instance
   $('#aButton').bind('click',function(){ //When the aButton is clicked, this function will be invoked.
     //Write your business logic here
   });
 });
 ```
 
 With decj, you only need to declare the event binding, there is no need to invoke any event binding API, hence you can put more
 energy on your business logic:
 ```javascript
 define(function(){ 
   return { //Define an AMD module here
   //Code you need to write for event bindings
      events:{
        "click@#aButton":function(){//When the aButton is clicked, this function will be invoked.
          //Write your business logic here
        }
      }
   //End of event bindings
   };
 });
 ```  
  At first glance, this code seems to "larger" than code written in jQuery. However, in fact , other parts of the above code
  are for defining an AMD module, the only code you need write for event binding is just:
   ```javascript
   events:{
        "click@#aButton":function(){//When the aButton is clicked, this function will be invoked.
          //Write your business logic here
      }
    }
    ```  
      
* Code is document: code of a decj app can serve as a document.

  One can easily get to know information on event bindings and other information from decj app code.
  For example, from the code shown as below, one can quickly know that the click event of button aButton is handled
  by which function.

 ```javascript
 define(function(){ 
   return { //Define an AMD module here
      events:{
        "click@#aButton":function(){//When the aButton is clicked, this function will be invoked.
          //Write your business logic here
        }
      }
   
   };
 });
 ```   

[Features]:

* Declarative Cross-browser Event Binding
* Declarative Internationalization(I18N) Support:support mutli-language and on-demand dynamic resource file loading
* Declarative CSS Files on-demand Dynamic Load
* Declarative Javascript Files on-demand Dynamical Load
* Declarative HTML Form Enhancement:Form Auto-fill with JSON,Form AJAX Auto-Submission(support JSON),Form Reset Enhancement,Form Validation and Form Formatting
* Concurrently Loading of HTML Code/CSS Files/Javascript Files/Resouce Files
* Declarative Page/Module Intialization

Live Demo:
http://decj.viscenthuang.info/demo/page/basic.htm
