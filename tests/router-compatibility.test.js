import test from 'node:test';
import assert from 'node:assert/strict';
import * as router from 'react-router-dom';

const REQUIRED_DECLARATIVE_EXPORTS = [
  'BrowserRouter',
  'Routes',
  'Route',
  'Navigate',
  'Link',
  'NavLink',
  'Outlet',
  'useNavigate',
  'useLocation',
  'useParams'
];

test('el adaptador temporal conserva las APIs declarativas usadas por IsiVoltPro', () => {
  for (const exportName of REQUIRED_DECLARATIVE_EXPORTS) {
    assert.ok(router[exportName], `Falta la exportación ${exportName}`);
  }
});
