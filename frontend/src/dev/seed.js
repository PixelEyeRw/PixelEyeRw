export function seedDev() {
  if (typeof window === 'undefined') return;
  try {
    const existing = window.localStorage.getItem('pixeleye-accounts');
    if (!existing) {
      const accounts = [
        { id: 'account_om_1', name: 'Jordan Vance', email: 'jordan@studio.test', role: 'Operations Manager', password: 'pass' },
        { id: 'account_am_1', name: 'Elena Rossi', email: 'elena@studio.test', role: 'Account Manager', password: 'pass' },
        { id: 'account_prod_1', name: 'Sam Producer', email: 'sam@studio.test', role: 'Video Editor', password: 'pass' },
        { id: 'account_dir_1', name: 'Avery Blake', email: 'avery@studio.test', role: 'Director', password: 'pass' },
      ];
      window.localStorage.setItem('pixeleye-accounts', JSON.stringify(accounts));
      console.info('PixelEye: seeded dev accounts (jordan/elena/sam with password "pass").');
    }

    const existingInv = window.localStorage.getItem('pixeleye-invites');
    if (!existingInv) {
      const invites = [
        { id: 'invite_1', email: 'new@studio.test', role: 'Account Manager', createdAt: new Date().toISOString(), status: 'Pending', link: `${window.location.origin}${window.location.pathname}?invite=invite_1` },
      ];
      window.localStorage.setItem('pixeleye-invites', JSON.stringify(invites));
      console.info('PixelEye: seeded dev invite (new@studio.test).');
    }
  } catch (e) {
    // ignore
  }
}
