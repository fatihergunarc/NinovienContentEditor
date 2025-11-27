import React from 'react';
import {
    MemoizedExtendedKoenigEditor,
    useKoenigEditor
} from '@fatih_ergun/koenig-lexical';

// bu test etmek için kullanılan initialHtml
const initialHtml = '<p dir="ltr"><span style="white-space: pre-wrap;">There\'s a whole lot to discover in this editor</span></p>'

export const KonigComposerDemo = () => {
    // bu hook ve fonksiyonlar ile editor'e value set edebilir ve editor'deki value'yi alabiliriz.
    const {getHtml, setHtml} = useKoenigEditor()
    const [htmlOutput, setHtmlOutput] = React.useState()

    return (
        <>
            <div className="flex flex-1">
                <button onClick={() => {
                    setHtml(initialHtml)
                    setHtmlOutput(initialHtml)
                }}
                >
                    Set Initial HTML
                </button>
                <button onClick={() => {
                    getHtml().then(html=> {
                        setHtmlOutput(html)
                    })
                }}
                >
                    Get  HTML
                </button>
            </div>
            {/* burda koenig-lexical class olmasi lazim */}
            <div className="flex flex-1 koenig-lexical h-full" style={{height: '100vh'}}>
                <MemoizedExtendedKoenigEditor />
            </div>
            <h2>HTML Output</h2>
            {/* onemli! html'i gostermek istediginiz yerde parent elemente koenig-lexical ve kg-prose classlar asagidaki gibi eklenmelidir  */}
            <div className="koenig-lexical">
            <div className='kg-prose' dangerouslySetInnerHTML={{__html: htmlOutput}} />
            </div>
        </>
    );
};
