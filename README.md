# mailoauth2

a node js application for sending email from the server with 4 api endpoints with proper documentation for those api’s.


<h1>API's</h1>
<h2>Backend hosted URL</h2>
<li>https://nodemaileroauth.herokuapp.com//signup</li>
<li>https://nodemaileroauth.herokuapp.com/login</li>
<li>https://nodemaileroauth.herokuapp.com/forgetpassword</li>
<li>https://nodemaileroauth.herokuapp.com/mailsend</li>

<br/>

<h3>Signup API :</h3>

<p>Anyone can access those api and create an account with the signup api using basic signup information like name, email address and password.</p>
<h4>Example Parameters :
{
    "email":"banupriyamohanrajoffl@gmail.com",
    "password":"banu"
}
</h4>


<img src="https://user-images.githubusercontent.com/80317026/199461719-1b81e680-2a66-49e5-aeb5-7fe76b2ebe30.png" width="100%"></img>

<h4>Signup Email has been successfully sent</h4>
<img src="https://user-images.githubusercontent.com/80317026/199466039-8ec6d947-0ba9-4a05-94f6-d9e60bb6c63f.png" width="100%"></img>


<h3>Login API :</h3>
<p>while using login api with email and password, the user must be able to successfully login </p>

<h4>Example Parameters :
{
    "email":"banupriyamohanrajoffl@gmail.com",
    "password":"banu"
}
</h4>



<img src="https://user-images.githubusercontent.com/80317026/199463481-184164b2-9632-4b36-9ca2-97de3887b5e2.png" width="100%"></img>

<h3>Forget Password API :</h3>
<p>When the user hits the forget password API with the user mail ID, the server should send an email with a random password which can be used for upcoming logins.</p>

<h4>Example Parameters :
{
    "email":"banupriyamohanrajoffl@gmail.com"
}
</h4>


<img src="https://user-images.githubusercontent.com/80317026/199464581-df280c43-5bea-4f42-9c51-fc312d918012.png" width="100%"></img>

<h4>Password reset Email has been successfully sent</h4>
<img src="https://user-images.githubusercontent.com/80317026/199466388-864fd4b4-c7bb-4cb1-bbaf-fc8fa11f2deb.png" width="100%"></img>


<h3>Mail send API :</h3>
When the user hits the “mail send” api with authkey, receiver email address, subject line and mail content, send an mail to the receiver mail to the receivers mail ID from the server.

<h4>Example Parameters :
{
    "email":"banupriyamohanrajoffl@gmail.com",
    "subject":"Message from nodemailer",
    "mailContent":"Hello from nodemailer Server"
    
}
</h4>

<img src="https://user-images.githubusercontent.com/80317026/199467905-b35279b6-327a-4249-8ebe-31ea7b94c25b.png" width="100%"></img>


<h4>Email sent from server to user successfully</h4>
<img src="https://user-images.githubusercontent.com/80317026/199468196-a62c334e-63b4-469c-9cb5-f614ab035b0c.png"></img>





