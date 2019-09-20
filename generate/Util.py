# Util
from __future__ import print_function
import re
import cgi
import time
import datetime
import sys
import os.path
import os
import stat

import json
import Assert
from bson.objectid import ObjectId

import Response

res = Response.Response()

def strip( str ):
    return re.sub(r"\W", "", str)

def getCurrentDate():
    return int(time.time())

def getCurrentYear():
    now = datetime.datetime.now()
    return now.year


def id( the_id ):
    obj = ObjectId(the_id)
    return {"_id": obj}


def getP( param ):
    arguments = cgi.FieldStorage()

    if param in arguments:

        val = arguments[param].value
        Assert.defined( val, param )
        return val
    else:
        return 0


#  get URL parameters and return 0 if it's not found.
def requireP( param ):

    arguments = cgi.FieldStorage()

    if param in arguments:

        val = arguments[param].value
        Assert.defined( val, param )
        return val
    else:
        res.error('Parameter ' + param + ' is not defined.')


def getMust( param, dictionary ):

    if param in dictionary:
        return dictionary[param].value
    else:
        res.add('missing_dictionary_contents', dictionary)
        res.error('Could not find parameter ' + param + ' inside a dictionary')


logging = 1

def initLog():

    if logging == 1:
        path = "../test/log.html"
        if os.path.isfile(path):
            os.remove(path)

            file = open(path, "a")
            file.write( "<script src='../js/Log.js'></script>")
            file.close()
            os.chmod(path, stat.S_IROTH | stat.S_IWOTH | stat.S_IWUSR )

initLog()


def log( str ):

    if logging == 1:
        path = "../test/log.html"

        file = open(path, "a")
        file.write( "<div style='line-height: 1.4; font-size: 16px;'>" + str + "</div>")
        file.close()

        os.chmod(path, stat.S_IROTH | stat.S_IWOTH | stat.S_IWUSR )


#  Print error message to error log file.
def error(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)


#  a db.reports.find() is not a hash and can't be returned by the Response object
#  so convert it into a hash based on unique ID.
def convertToHash( db_find_result ):

    my_hash = {}

    for obj in db_find_result:
        id = str(obj['_id'])
        my_hash[id] = {}

        for val in obj:
            if val != "_id":
                my_hash[id][val] = obj[val]
            else:
                my_hash[id]['id'] = id

    return my_hash


def isProd():
    req = os.environ["REQUEST_URI"]
    #  use Reg expression ^/narf
    mylist = re.findall("^/narf", req)
    mylen = len(mylist)
    return mylen > 0



#def check_int( param ):
