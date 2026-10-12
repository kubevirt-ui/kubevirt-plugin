import BaseComponent from '@/components/shared/base-component';
import OverviewQuickStartsPage from '@/page-objects/overview/overview-quick-starts-page';
import OverviewSshKeysPage from '@/page-objects/overview/overview-ssh-keys-page';
import type { Page } from '@playwright/test';

/** Virtualization Overview SSH key management component. */
export default class OverviewSshComponent extends BaseComponent {
  readonly quickStarts: OverviewQuickStartsPage;
  readonly sshKeys: OverviewSshKeysPage;

  constructor(page: Page) {
    super(page);
    this.quickStarts = new OverviewQuickStartsPage(page);
    this.sshKeys = new OverviewSshKeysPage(page);
  }

  async checkQuickStartYesCheckbox() {
    return this.quickStarts.checkQuickStartYesCheckbox();
  }

  async clickQuickStartByTitle(title: string): Promise<void> {
    return this.quickStarts.clickQuickStartByTitle(title);
  }

  async clickQuickStartCloseButton() {
    return this.quickStarts.clickQuickStartCloseButton();
  }

  async clickQuickStartNextButton() {
    return this.quickStarts.clickQuickStartNextButton();
  }

  async clickQuickStartStartButton() {
    return this.quickStarts.clickQuickStartStartButton();
  }

  async clickReviewFailed(): Promise<void> {
    return this.quickStarts.clickReviewFailed();
  }

  async clickReviewSuccess(): Promise<void> {
    return this.quickStarts.clickReviewSuccess();
  }

  async dismissBlockingModals(): Promise<void> {
    return this.quickStarts.dismissBlockingModals();
  }

  async handleQuickStartRestartIfNeeded() {
    return this.quickStarts.handleQuickStartRestartIfNeeded();
  }

  async navigateToQuickStart() {
    return this.quickStarts.navigateToQuickStart();
  }

  async navigateToQuickStartViaUI(): Promise<void> {
    return this.quickStarts.navigateToQuickStartViaUI();
  }

  async navigateToSSHKeysManagement() {
    return this.sshKeys.navigateToSSHKeysManagement();
  }

  async openCreateVmFromVolumeQuickStart() {
    return this.quickStarts.openCreateVmFromVolumeQuickStart();
  }

  async saveSSHKey(secretName?: string, filePath?: string): Promise<boolean> {
    return this.sshKeys.saveSSHKey(secretName, filePath);
  }

  async selectProjectByNamespace(namespace: string): Promise<void> {
    return this.sshKeys.selectProjectByNamespace(namespace);
  }

  async selectProjectInSSHSettings(projectName: string): Promise<void> {
    return this.sshKeys.selectProjectInSSHSettings(projectName);
  }

  async verifyDangerAlertNotVisible(): Promise<boolean> {
    return this.quickStarts.verifyDangerAlertNotVisible();
  }

  async verifyDangerAlertVisible(): Promise<boolean> {
    return this.quickStarts.verifyDangerAlertVisible();
  }

  async verifyPublicSSHKeyVisible(): Promise<boolean> {
    return this.sshKeys.verifyPublicSSHKeyVisible();
  }

  async verifyQuickStartComplete(): Promise<boolean> {
    return this.quickStarts.verifyQuickStartComplete();
  }

  async verifyQuickStartSuccessMessage(): Promise<boolean> {
    return this.quickStarts.verifyQuickStartSuccessMessage();
  }

  async verifyQuickStartTileComplete(tileId: string): Promise<boolean> {
    return this.quickStarts.verifyQuickStartTileComplete(tileId);
  }

  async verifyReviewFailed(): Promise<boolean> {
    return this.quickStarts.verifyReviewFailed();
  }

  async verifyReviewSuccess(): Promise<boolean> {
    return this.quickStarts.verifyReviewSuccess();
  }

  async verifySuccessAlertVisible(): Promise<boolean> {
    return this.quickStarts.verifySuccessAlertVisible();
  }
}
