''' Demonstration of swapping optimizers on a problem '''

from openmdao.examples.simple.paraboloid_derivative import ParaboloidDerivative
from openmdao.examples.simple.paraboloid import Paraboloid
from openmdao.lib.differentiators.api import FiniteDifference
from openmdao.lib.drivers.api import COBYLAdriver, CONMINdriver, \
        NEWSUMTdriver, SLSQPdriver, Genetic
from openmdao.main.api import Assembly

class DemoOpt(Assembly):
    """Constrained optimization of the Paraboloid with whatever optimizer
    we want."""
    
    def configure(self):
        """ Creates a new Assembly containing a Paraboloid and an optimizer"""
        
        # Create Paraboloid component instances
        self.add('comp', Paraboloid())

        # Create CONMIN Optimizer instance
        self.add('driver', NEWSUMTdriver())
        
        # Driver process definition
        self.driver.workflow.add('comp')
        
        # Optimizer-specific Flags
        self.driver.iprint = 0
        self.driver.itmax = 30
        self.driver.fdch = .000001
        self.driver.fdchm = .000001
        
        # Objective 
        self.driver.add_objective('comp.f_xy')
        
        # Design Variables 
        self.driver.add_parameter('comp.x', low=-50., high=50.)
        self.driver.add_parameter('comp.y', low=-50., high=50.)
        
        # Inequality Constraints
        self.driver.add_constraint('comp.x-comp.y >= 15.0')
        
        # Equality Constraints
        # self.driver.add_constraint('comp.x-comp.y=15.0')
        
        # Differentiator
        #self.driver.differentiator = FiniteDifference()
        
        
if __name__ == "__main__": # pragma: no cover         

    import time
    
    opt_problem = DemoOpt()
    
    t1 = time.time()
    opt_problem.run()
    t2 = time.time()

    print "\n"
    print "Optimizer: %s" % type(opt_problem.driver)
    print "Function executions: ", opt_problem.comp.exec_count
    print "Gradient executions: ", opt_problem.comp.derivative_exec_count
    print "Minimum found at (%f, %f)" % (opt_problem.comp.x, \
                                         opt_problem.comp.y)
    print "Elapsed time: ", t2-t1, "seconds"