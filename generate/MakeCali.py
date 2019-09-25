#!/usr/global/tools/lorenz/python/narf-env/bin/python
from pprint import pprint
from random import randint
from random import uniform
from random import choice
import sys
import time


class CaliGen:
    def __init__(self ):

        template_loc = "template"
        file = open( template_loc, "r" )
        self.template = file.read()


    def make(self, make_num ):

        output_loc = "/g/g0/pascal/lulesh_gen/"

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
            "LAUNCHDATE": {
                "range": [unow - 4800200, unow],
                "type": "integer"
            },
            "CMDLINE": {
                "range": ["[lulesh2.0, -P, spot, -b, 1, -s,60,-c,1]", "[-CFLAGS]", "[-runtime,-p,-3]", "[-cm,-blank]"],
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
                val = randint( range[0], range[1] )

            cali_con = cali_con.replace( key, str(val) )


        return cali_con


    def dump(self, obj):
        for attr in dir(obj):
            print("obj.%s = %r" % (attr, getattr(obj, attr)))


mycali = CaliGen()
#output_dir = sys.argv.length > 0

mycali.make( sys.argv[1] )


