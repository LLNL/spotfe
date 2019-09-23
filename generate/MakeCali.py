#!/usr/global/tools/lorenz/python/narf-env/bin/python
from pprint import pprint
from random import randint
from random import uniform
from random import choice

class CaliGen:
    def __init__(self):

        template_loc = "template"
        file = open( template_loc, "r" )
        self.template = file.read()


    def make(self):

        output_loc = "/g/g0/pascal/lulesh_gen/"

        for i in range(0,20):

            index = str(i)

            file = open( output_loc + index + ".cali", "w")
            output = self.get_output()
            file.write( output )
            file.close()



    def get_output(self):

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
mycali.make()


