import { BrailleConverter, BrailleDOMRenderer } from 'opensheetmusicdisplay';

export const BRAILLE_ATTRIBUTE_NAMES = [
    'brailleEnabled',
    'brailleHideScore',
    'brailleLyrics',
    'brailleBarOverBar',
    'brailleEnsemble',
    'brailleFacsimile',
    'brailleShowTranslation'
];

export function renderBraille(osmd, settings, containerEl){
    if(!containerEl){
        return;
    }
    containerEl.innerHTML = '';
    if(!settings || !settings.brailleEnabled || !osmd || !osmd.Sheet){
        return;
    }
    try {
        const output = new BrailleConverter().convert(osmd.Sheet, {
            lyrics: !!settings.brailleLyrics,
            barOverBar: !!settings.brailleBarOverBar,
            ensemble: !!settings.brailleEnsemble,
            format: settings.brailleFacsimile ? 'facsimile' : 'nonfacsimile',
            graphicSheet: osmd.GraphicSheet,
            debugMode: !!settings.brailleShowTranslation
        });
        const outputElement = new BrailleDOMRenderer().render(output, !!settings.brailleShowTranslation);
        // Aligned formats pad with braille cells, so they only line up in a monospace font.
        const needsMonospace = settings.brailleLyrics || settings.brailleBarOverBar || settings.brailleEnsemble;
        if(needsMonospace){
            const textElement = outputElement.querySelector('.osmd-braille-text');
            if(textElement){
                textElement.style.fontFamily = "'Consolas', 'Courier New', 'DejaVu Sans Mono', monospace";
                textElement.style.fontFeatureSettings = "'liga' 0";
            }
        }
        containerEl.appendChild(outputElement);
    } catch(err){
        console.warn('Error generating Music Braille: ', err);
        const message = document.createElement('p');
        message.className = 'phonicscore-opensheetmusicdisplay__braille-error';
        message.textContent = 'Could not generate Music Braille for this score.';
        containerEl.appendChild(message);
    }
}
