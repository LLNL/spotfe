#!/usr/global/tools/lorenz/python/narf-env/bin/python


class CaliGen:
    def __init__(self):

        template_loc = "template"
        file = open( template_loc, "r" )
        self.template = file.read()


    def make(self):

        output_loc = "/g/g0/pascal/lulesh_gen/"

        index = "0"
        file = open( output_loc + index + ".cali", "w")

        output = self.get_output()
        file.write( output )
        file.close()



    def get_output(self):

        stub_values = {
            "FIGURE_OF_MERIT": {
                range: [0, 8000],
                type: "float"
            },
            "ELAPSED_TIME": {
                range: [0, 400],
                type: "float"
            },
            "USER": {
                range: ["boehme3", "legendre1", "aschwanden1", "chavez35"],
                type: "string"
            },
            "ITERATIONS": {
                range: [0,12000000],
                type: "integer"
            }
        }

        cali_con = self.template

        for key, value in stub_values.items():

            self.dump(value)
            exit

            if value['type'] == "float":
                val = 2038
            else:
                val = 90000

            cali_con = cali_con.replace( key, str(val) )


        return cali_con


    def dump(self, obj):
        for attr in dir(obj):
            print("obj.%s = %r" % (attr, getattr(obj, attr)))


mycali = CaliGen()
mycali.make()


