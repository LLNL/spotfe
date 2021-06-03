#!/bin/bash

echo "Content-type: text/plain"
echo ""

IFS='=&'
parm=($QUERY_STRING)
#echo "p0="${parm[0]}
#echo "p1="${parm[1]}
#echo "p2="${parm[2]}


#echo $QUERY_STRING
#echo 'ds='$dataSetKey
#echo ${QUERY_STRING['dataSetKey']}


#cat /g/g0/pascal/big2
cat ${parm[1]}

exit 0
