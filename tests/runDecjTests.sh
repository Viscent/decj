#!/usr/bin/ksh

#By Viscent Huang 2013

main(){
  typeset browser="$1"
  typeset browserExe="$2"
  typeset seleniumPath="/home/viscent/apps/selenium-server-standalone-2.37.0.jar"
  typeset testSuitePath="/home/viscent/github/decj/tests"
  typeset testReportPath="/home/viscent/tmp/${browser}"
  
  if [ 0 ==  $# ]; then
    echo "./runDecjTests.sh <browserName> <path to browser executable>"
    echo "For example: ./runDecjTests.sh firefox /usr/lib/firefox/firefox"
    exit 1
  fi
  
  mkdir -p "$testReportPath"
  cd "$testSuitePath"

  typeset testSuites=`ls ./-*.html`
  
  for testSuite in ${testSuites};
  do
    testSuite="${testSuite:2}"
    java -jar "$seleniumPath" -htmlSuite "*$browser $browserExe" "http://your.testhost.com/" "$testSuitePath/${testSuite}" "$testReportPath/result${testSuite}"

    if [ ! 0 -eq $? ]; then
      exit -1
    fi
  done
}

main $@
