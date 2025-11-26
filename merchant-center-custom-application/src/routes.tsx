import type { ReactNode } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import DiscountPreview from './components/discount-preview';
import Overview from './components/overview';
import { Providers } from './contexts';

type ApplicationRoutesProps = {
  children?: ReactNode;
};
const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  const match = useRouteMatch();
  return (
    <Switch>
      <Route path={`${match.url}/overview`} exact>
        <Overview linkToWelcome={match.url} />
      </Route>
      <Route>
        <Providers>
          <DiscountPreview />
        </Providers>
      </Route>
    </Switch>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
