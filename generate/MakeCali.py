#!/usr/global/tools/lorenz/python/narf-env/bin/python


class CaliGen:
    def make(self):

        template_loc = "/g/g0/pascal/lulesh_gen/template"

        file = open( template_loc, "r" )
        template = file.read()

        print template






mycali = CaliGen()
mycali.make()


