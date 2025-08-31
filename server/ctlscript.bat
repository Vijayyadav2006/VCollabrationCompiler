@echo off
rem START or STOP Services
rem ----------------------------------
rem Check if argument is STOP or START

if not ""%1"" == ""START"" goto stop

if exist D:\server\hypersonic\scripts\ctl.bat (start /MIN /B D:\server\server\hsql-sample-database\scripts\ctl.bat START)
if exist D:\server\ingres\scripts\ctl.bat (start /MIN /B D:\server\ingres\scripts\ctl.bat START)
if exist D:\server\mysql\scripts\ctl.bat (start /MIN /B D:\server\mysql\scripts\ctl.bat START)
if exist D:\server\postgresql\scripts\ctl.bat (start /MIN /B D:\server\postgresql\scripts\ctl.bat START)
if exist D:\server\apache\scripts\ctl.bat (start /MIN /B D:\server\apache\scripts\ctl.bat START)
if exist D:\server\openoffice\scripts\ctl.bat (start /MIN /B D:\server\openoffice\scripts\ctl.bat START)
if exist D:\server\apache-tomcat\scripts\ctl.bat (start /MIN /B D:\server\apache-tomcat\scripts\ctl.bat START)
if exist D:\server\resin\scripts\ctl.bat (start /MIN /B D:\server\resin\scripts\ctl.bat START)
if exist D:\server\jetty\scripts\ctl.bat (start /MIN /B D:\server\jetty\scripts\ctl.bat START)
if exist D:\server\subversion\scripts\ctl.bat (start /MIN /B D:\server\subversion\scripts\ctl.bat START)
rem RUBY_APPLICATION_START
if exist D:\server\lucene\scripts\ctl.bat (start /MIN /B D:\server\lucene\scripts\ctl.bat START)
if exist D:\server\third_application\scripts\ctl.bat (start /MIN /B D:\server\third_application\scripts\ctl.bat START)
goto end

:stop
echo "Stopping services ..."
if exist D:\server\third_application\scripts\ctl.bat (start /MIN /B D:\server\third_application\scripts\ctl.bat STOP)
if exist D:\server\lucene\scripts\ctl.bat (start /MIN /B D:\server\lucene\scripts\ctl.bat STOP)
rem RUBY_APPLICATION_STOP
if exist D:\server\subversion\scripts\ctl.bat (start /MIN /B D:\server\subversion\scripts\ctl.bat STOP)
if exist D:\server\jetty\scripts\ctl.bat (start /MIN /B D:\server\jetty\scripts\ctl.bat STOP)
if exist D:\server\hypersonic\scripts\ctl.bat (start /MIN /B D:\server\server\hsql-sample-database\scripts\ctl.bat STOP)
if exist D:\server\resin\scripts\ctl.bat (start /MIN /B D:\server\resin\scripts\ctl.bat STOP)
if exist D:\server\apache-tomcat\scripts\ctl.bat (start /MIN /B /WAIT D:\server\apache-tomcat\scripts\ctl.bat STOP)
if exist D:\server\openoffice\scripts\ctl.bat (start /MIN /B D:\server\openoffice\scripts\ctl.bat STOP)
if exist D:\server\apache\scripts\ctl.bat (start /MIN /B D:\server\apache\scripts\ctl.bat STOP)
if exist D:\server\ingres\scripts\ctl.bat (start /MIN /B D:\server\ingres\scripts\ctl.bat STOP)
if exist D:\server\mysql\scripts\ctl.bat (start /MIN /B D:\server\mysql\scripts\ctl.bat STOP)
if exist D:\server\postgresql\scripts\ctl.bat (start /MIN /B D:\server\postgresql\scripts\ctl.bat STOP)

:end

