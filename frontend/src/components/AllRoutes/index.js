import { useRoutes } from 'react-router-dom'
import { routes } from '../../routes/index';

function AllRouter(){
  const elements = useRoutes(routes);
  return (
    <>
      {elements}
    </>
  )
}

export default AllRouter;