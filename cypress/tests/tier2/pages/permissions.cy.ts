import { adminOnlyDescribe, TEST_NS } from '../../../utils/const/index';

adminOnlyDescribe('Install checkup permissions', () => {
  it('install permissions', () => {
    cy.exec(`oc apply -n ${TEST_NS} -f utils/data/latency_sa_r_cr_rb_crb.yaml`);
    cy.exec(`oc apply -n ${TEST_NS} -f utils/data/storage_sa_r_cr_rb_crb.yaml`);
  });
});
