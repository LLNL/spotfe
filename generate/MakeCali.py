#!/usr/global/tools/lorenz/python/narf-env/bin/python
from pprint import pprint
from random import randint
from random import uniform
from random import choice
import sys
import time
import os
from pathlib import Path

class CaliGen:
    def __init__(self ):

        template_loc = "template"
        file = open( template_loc, "r" )
        self.template = file.read()


    def make(self, make_num ):

        output_loc = "/g/g0/pascal/lulesh_gen/"
        spot_file = output_loc + ".spot_cache1.pkl"
        file = Path( spot_file )

        if file.is_file():
            os.unlink( spot_file )

        for i in range(0, int(make_num)):

            index = str(i)

            file = open( output_loc + index + ".cali", "w")
            output = self.get_output()
            file.write( output )
            file.close()



    def get_output(self):

        unow = int(time.time())

        stub_values = {
            "FIGURE_OF_MERIT": {
                "range": [0, 8000],
                "type": "float"
            },
            "ELAPSED_TIME": {
                "range": [0, 400],
                "type": "float"
            },
            "USER": {
                "range": ["boehme3", "legendre1", "aschwanden1", "chavez35"],
                "type": "string"
            },
            "ITERATIONS": {
                "range": [0,12000000],
                "type": "integer"
            },
            "EXECUTABLEPATH": {
                "range": ["/g/g90/boehme3/src/LULESH/build-toss3/lulesh2.0",
                          "/g/g70/aschwanden/src/LULESH_X/build-20/lulesh3.0",
                          "/etc/crons",
                          "/home/bin/",
                          "/usr/group/boehme/lorenz/lulesh283.2",
                          "/user/bin/cav/",
                          "/bin/etc/host",
                          "/hosts/bin/serv",
                          "/var/log/serv/bin",
                          "/bin",
                          "/g/g90/johnson234/exe/STRIP_HEADER/toss17/impending4.8-3472",
                          "/g/home/exe-no-exceptions/bin/"],
                "type": "string"
            },
            "JOBSIZE": {
                "range": [1, 5],
                "type": "integer"
            },
            "THREADS": {
                "range": [31, 125],
                "type": "integer"
            },
            "LAUNCHDATE": {
                "range": [unow - 4800200, unow],
                "type": "integer"
            },
            "PROBLEM_SIZE": {
                "range": [50, 85],
                "type": "integer"
            },
            "REGION_BALANCE": {
                "range": [0,12],
                "type": "integer"
            },
            "REGION_COST": {
                "range": [3,5],
                "type": "integer"
            },
            "CMDLINE": {
                "range": ["[lulesh2.0, -P, spot, -b, 1, -s,60,-c,1]",
                          "[-CFLAGS]", "[-runtime,-p,-3]",
                          "[-cm,-blank]",
                          "[-simmer 89]",
                          "[-runflag -f, 60,-83, -NONULL_ACTIV]",
                          "[-ksy active, 47, feature89]",
                          "[-kysjqkqj, FFIM]",
                          "[-SIM Mac, emploer8934]",
                          "[-JIM, -48473, mac10,20, mac2015, 2019]",
                          "[-Epsonprinter8389, 2341234]",
                          "[-dash fin]",
                          "[-COM regs]",
                          "[-active COM, etc//ban/bk]",
                          "[-user/etc/]",
                          "[-bin]",
                          "[-exe]",
                          "[-28343-b83, bin/active/sender/grid.fjs]",
                          ],
                "type": "string"
            },
            "LIBRARIES": {
                "range": ["GCC-4.93", "lib/fortran/sur/tc", "gilib", "libc/package",
                          "quant/etc/package", "lulesh4834.23", "jasdf-lulesh", "packaged-soup/etc/home",
                          "shrimp", "jasdf/72343/asdfjasdf", 'sanda-fkasdfj/asdf',
                          "/home/pak", "/etc/fin/etc/home.jafd"],
                "type": "string"
            },
            "CLUSTER": {
                "range": ["quartz", "diamond", "mustard", "treetops",
                          "greenquartz", "bluequartz", "bluerocks", "greenrocks", "yellowrocks",
                          "rockbrick", "rockpattern", "rock0", "rock2038", "skyrock", "Rockville", "rocktissue", "rockB", "rockc",
                          "rocketc", "rockberry", "rockbook", "temprock", "rockfiro"],
                "type": "string"
            },
            "SPOT_METRICS": {
                "range": [
                    "avg#inclusive#sum#time.duration\,min#inclusive#sum#time.duration\,max#inclusive#sum#time.duration",
                          "min#inclusive#max#time.dur",
                          "max#include#sum#time#duration\,min#max#inclusive",
                          "avg#face.duration#inclusive#sum",
                          "#sum.sum#duration#inclusive",
                          "min#min.min#max#.duration",
                          "avg#face.duration#inclusive#sumwert",
                          "#sum.sum#duration#inclusivewert",
                          "min#min.min#max#.durationwret",
                          "avg#face.duration#inclusive#sum5345",
                          "#sum.sum#duration#inclusive45345",
                          "min#min.min#max#.duratio3454n",
                          "max#duration",
                          "duration#sim",
                          "dur/etcation#sim",
                          "durat4234ion#sim",
                          "duration#trertsim",
                          "duration#simwtert",
                          "duration#sim5849358345",
                          "small#avg.duration.insclusive",
                          "optional#max#duration"],
                "type": "string"
            }
        }


        cali_con = self.template

        #pprint(stub_values)

        for key, value in stub_values.items():

            vtype = value['type']
            range = value["range"]

            if vtype == "float":
                val = uniform( range[0], range[1] )
            elif vtype == "string":
                val = choice( range )
            elif vtype == "integer":

                first = key[:1]
                ha = hash(first)
                mod = ha % 8

                #pprint( mod )
                low = range[0]
                high = range[1]
                diff = high - low

                val = randint( low, high )

            cali_con = cali_con.replace( key, str(val) )


        return cali_con


    def dump(self, obj):
        for attr in dir(obj):
            print("obj.%s = %r" % (attr, getattr(obj, attr)))


mycali = CaliGen()
#output_dir = sys.argv.length > 0

mycali.make( sys.argv[1] )


