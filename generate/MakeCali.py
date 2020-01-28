#!/usr/global/tools/lorenz/python/narf-env/bin/python
from pprint import pprint
from random import randint
from random import uniform
from random import choice
import sys
import time
import os
from pathlib import Path
import glob, os, os.path

class CaliGen:
    def __init__(self ):

        template_loc = "template"
        file = open( template_loc, "r" )
        self.template = file.read()


    def make(self, make_num, option ):

        multi_dir = "multi/" if option == "multi" else ""
        output_loc = "/g/g0/pascal/lulesh_gen/" + multi_dir + make_num + "/"

        if not os.path.exists(output_loc):
            os.makedirs(output_loc)

        spot_file = output_loc + ".spot_cache1.pkl"
        file = Path( spot_file )

        # remove all the previous *.cali files.
        filelist = glob.glob(os.path.join(output_loc, "*.cali"))
        for f in filelist:
            os.remove( f )


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
                val = self.get_rand(key, range)

            elif vtype == "string":

                str_range = [0, len(range) - 1 ]
                val = self.get_rand(key, str_range)
                val = int(round(val))
                val = range[val]

            elif vtype == "integer":
                val = self.get_rand( key, range )
                val = int(round(val))

            cali_con = cali_con.replace( key, str(val) )

        return cali_con


    def get_rand(self, key, range ):

        dist = [
            [0,0.1,0.15, 0.17,0.2, 0.24, 0.28,0.3,0.4,0.5,0.6,0.7,0.8,0.9, 0.85, 0.95, 0.98, 0.93, 0.82, 0.78, 1],
            [0, 0.05, 0.07, 0.1, 0.12, 0.14, 0.16, 0.17, 0.18, 0.19, 0.20, 0.22, 0.72, 0,85, 0.98, 0.95, 0.99, 0.90],
            [0, 0.03, 0.07, 0.10, 0.61, 0.62, 0.63, 0.64, 0.65, 0.76, 0.77, 0.78, 0.89, 1],
            [0, 0.02, 0.04, 0.06, 0.1, 0.2, 0.27, 0.41, 0.42, 0.46, 0.48, 0.53, 0.56, 0.60, 0.58, 0.79, 0.85, 0.9, 0.91, 0.92, 1],
            [0, 0.01, 0.1, 0.22, 0.3, 0.37, 0.43, 0.47, 0.45, 0.46, 0.47, 0.48, 0.49, 0.5, 0.51, 0.52, 0.53, 0.55, 0.57, 0.58, 0.59, 0.62, 0.67, 0, .70, 0.9, 0.95, 0.98, 1],
            [0,0.05, 0.07, 0.1, 0.12, 0.14, 0.18, 0.21, 0.3, 0.4, 0.45, 0.5, 0.8, 0.83, 0.88, 0.90, 0.94, 0.97, 0.99],
            [0,0.05, 0.08, 0.03, 0.11, 0.2, 0.3, 0.45, 0.48, 0.52, 0.81, 0.2, 0.3, 0.4, 0.83, 0.85, 0.88, 0.90, 0.92, 0.97, 0.99],
            [0.02, 0.03, 0.05, 0.07, 0.1, 0.13, 0.15, 0.16, 0.17, 0.22, 0.27, 0.33, 0.43, 0.5, 0.6, 0.65, 0.72, 0.74, 0.75, 0.79, 0.82, 0.84, 0.85, 0.91, 0.95, 0.99],
            [0.02, 0.03, 0.05, 0.07, 0.1, 0.13, 0.15, 0.23,0.23,0.23,0.3, 0.4, 0.46, 0.57, 0.72, 0.74, 0.75, 0.79, 0.82, 0.84, 0.85, 0.9, 0.93, 0.97],
            [0.02, 0.03, 0.05, 0.07, 0.1, 0.23, 0.25, 0.16, 0.17, 0.3, 0.4, 0.5, 0.6, 0.7, 0.72, 0.74, 0.75, 0.76, 0.77, 0.78, 0.78,0.78,0.78,0.78, 0.79, 0.82, 0.84, 0.85, 0.9, 0.95, 0.99],
            [0.02, 0.03, 0.05, 0.07, 0.1, 0.13, 0.15, 0.16, 0.17, 0.2, 0.3, 0.4, 0.5, 0.6, 0.611, 0.613, 0.615, 0.61, 0.62, 0.63, 0.64, 0.65, 0.66, 0.68, 0.72, 0.74, 0.75, 0.79, 0.82, 0.84, 0.85],
        ]


        first = key
        ha = hash(first)
        distribution = ha % len(dist)
        dist_arr = dist[distribution]
        offset_per = choice( dist_arr )

        if offset_per > 1:
            offset_per = 1

        #pprint( key )
        #pprint( dist_arr )

        low = range[0]
        high = range[1]
        diff = high - low
        offset = diff * offset_per

        val = low + offset
        return val


    def dump(self, obj):
        for attr in dir(obj):
            print("obj.%s = %r" % (attr, getattr(obj, attr)))


mycali = CaliGen()
#output_dir = sys.argv.length > 0

if len(sys.argv) < 3:
    options = ""
else:
    options = sys.argv[2]

mycali.make( sys.argv[1], options )


