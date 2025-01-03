/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import Container from 'typedi';
import { Setup } from '../services/setup';
import { ISettingsService } from 'src/types/settings/settings.service.type';

/* global console, document, Excel, Office */

// The initialize function must be run each time a new page is loaded
Office.onReady(async () => {
  try
  {
    Office.addin.setStartupBehavior(Office.StartupBehavior.load);
    Setup.registerServices();

    if (!await tryInitialiseApiKey()) {
      return;
    }

    if (!trySetBtnOnClickHandler('btn-ok', 'ok', () => btnOkOnClickHandler())) {
      return;
    }

    if (!trySetBtnOnClickHandler('btn-cancel', 'cancel', () => btnCancelOnClickHandler())) {
      return;
    }

    if (!tryInitialiseUnitLabels()) {
      return;
    }

    await loadUnit();
    handleEnterKey();
  }
  catch (e: unknown) {
    console.error(`Unexpected error: ${e}`);
  }
});

function handleEnterKey() {
  $(window).keypress(function(e) {
    if (e.which === 13) {
      btnOkOnClickHandler();
    }
  });
}

async function tryInitialiseApiKey(): Promise<boolean> {
  const apiKeyTextBox: HTMLInputElement | null = getApiKeyTextBox();

  if (!apiKeyTextBox) {
    return false;
  } else {
    apiKeyTextBox.oninput = updateBtnOkState;

    const settings = Container.get<ISettingsService>('service.settings');
    const apiKey: string | null | undefined = await settings.getApiKeyAsync();
    
    if (apiKey && apiKey.length > 0) {
      apiKeyTextBox.value = apiKey;
      updateBtnOkState();
    }

    return true;
  }
}

function trySetBtnOnClickHandler(btnId: string, btnName: string, btnOnClickHandler: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null): boolean {
  const button: HTMLButtonElement | null = getButton(btnId, btnName);

  if (!button) {
    return false;
  } else {
    button.onclick = btnOnClickHandler;
    return true;
  }
}

function tryInitialiseUnitLabels(): boolean {
  const unitLabels = document.querySelectorAll<HTMLInputElement>('.btn-group > label > input');

  if (unitLabels) {
    unitLabels.forEach((inputLabel) => {
      inputLabel.onclick = (ev: MouseEvent) => unitLabelOnClickHandler(ev, inputLabel);
    });

    return true;
  }
  else
  {
    console.error('Could not find the unit labels.');
    return false;
  }
}

function getApiKeyTextBox(): HTMLInputElement | null {
  const textBox: HTMLElement | null = document.getElementById('api-key-input');

  if (!textBox) {
    console.error('Could not find the API key text box.');
    return null;
  }

  return textBox as HTMLInputElement;
}

function getButton(btnId: string, btnName: string): HTMLButtonElement | null {
  const button: HTMLElement | null = document.getElementById(btnId);

  if (!button) {
    console.error(`Could not find the ${btnName} button.`);
    return null;
  }

  return button as HTMLButtonElement;
}

function updateBtnOkState() {
  try
  {
    const apiKeyTextBox: HTMLInputElement | null = getApiKeyTextBox();

    if (!apiKeyTextBox) {
      return;
    }

    const okButton: HTMLButtonElement | null = getButton('btn-ok', 'ok');

    if (!okButton) {
      return;
    }

    const apiKeyFromInput: string = apiKeyTextBox.value;

    if (apiKeyFromInput && apiKeyFromInput.length > 0) {
        okButton.classList.remove('disabled');
        okButton.classList.remove('btn-secondary');
        okButton.classList.add('btn-primary');
    } else {
        okButton.classList.remove('btn-primary');
        okButton.classList.add('disabled');
        okButton.classList.add('btn-secondary');
    }
  }
  catch (e: unknown) {
    console.error(`Unexpected error: ${e}`);
  }
}

async function btnOkOnClickHandler() {
  try
  {
    const apiKeyTextBox: HTMLInputElement | null = getApiKeyTextBox();

    if (!apiKeyTextBox) {
      return;
    }

    const apiKeyFromInput: string = apiKeyTextBox.value;

    if (apiKeyFromInput && apiKeyFromInput.length > 0) {
      const unit: string = getUnitAsyncFromInput();
      const settings = Container.get<ISettingsService>('service.settings');

      await settings.setApiKeyAsync(apiKeyFromInput);
      await settings.setUnitAsync(unit);

      Office.context.ui.messageParent(JSON.stringify({ apiKey: apiKeyFromInput, unit: unit}));
      // Office.context.ui.messageParent('');
    }
  }
  catch (e: unknown) {
    console.error(`Unexpected error: ${e}`);
  }
}
 
function btnCancelOnClickHandler() {
  try
  {
    Office.context.ui.messageParent('');
  }
  catch (e: unknown) {
    console.error(`Unexpected error: ${e}`);
  }
}

function unitLabelOnClickHandler(ev: MouseEvent, inputLabel: HTMLInputElement) {
  try
  {
    ev.preventDefault();

    const labels = document.querySelectorAll<HTMLInputElement>('.btn-group > label');

    if (labels) {
      $(labels).removeClass('active');
    }
    else {
      console.error('Unable to find the unit labels.');
    }

    if (inputLabel) {
      $(inputLabel).parent().addClass('active');
    }
    else {
      console.error('Unable to select the unit label.');
    }
  }
  catch (e: unknown) {
    console.error(`Unexpected error: ${e}`);
  }
}

function getUnitAsyncFromInput(): string {
  const labelUk = document.getElementById('label-uk');

  if (labelUk && labelUk.classList.contains('active')) {
    return 'uk';
  } else {
    const labelMetric = document.getElementById('label-metric');

    if (labelMetric && labelMetric.classList.contains('active')) {
      return 'metric';
    } else {
      return 'us';
    }
  }
}

async function loadUnit() {
  const settings = Container.get<ISettingsService>('service.settings');
  const unit: string | null | undefined = await settings.getUnitAsync();
  
  let unitLabel: HTMLElement | null = null;

  if (!unit) {
    unitLabel = document.getElementById('label-us');
  }
  else if (unit === 'uk') {
    unitLabel = document.getElementById('label-uk');
  } else if (unit === 'metric') {
    unitLabel = document.getElementById('label-metric');
  } else {
    unitLabel = document.getElementById('label-us');
  }

  if (unitLabel) {
    unitLabel.classList.add('active');
  }
  else {
    console.error('Unable to load the unit.');
  }
}

