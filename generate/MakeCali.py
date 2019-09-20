#!/usr/global/tools/lorenz/python/narf-env/bin/python


class CaliGen:
    def make(self):

        output_loc = "/g/g0/pascal/lulesh_gen/"
        template_loc = "template"

        file = open( template_loc, "r" )
        template = file.read()

        print template






mycali = CaliGen()
mycali.make()


