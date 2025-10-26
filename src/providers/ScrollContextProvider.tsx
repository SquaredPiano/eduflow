import React, { createContext, useContext, useRef, useEffect, useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import * as THREE from 'three';

import { archiveTextureTransitionAtom } from '@/store/activeArchiveNumberAtom';
import { currentPageState } from '@/store/pageTitleAtom';
import { isScrollStartAtom, isGallerySectionAtom, isScrollEndAtom } from '@/store/scrollAtom';

const ScrollContext = createContext({
  position: { current: 0 },
  ratio: { current: 0 },
}); //position,ratioはRefオブジェクトなので、再レンダリングを望まないコンポーネントで使用（DrumRoll等）

interface ScrollProviderProps {
  children: React.ReactNode;
}

//スクロール進捗とセクションへの侵入を監視する
export const ScrollProvider = ({ children }: ScrollProviderProps) => {
  //--------供給するのはRef。コンポーネントの再レンダリングを望まないため--------
  const scrollRef = useRef<number>(0);
  const scrollRatioRef = useRef<number>(0);
  const gallerySectionScrollYRef = useRef<number>(0);
  const gallerySectionElementRef = useRef<HTMLElement | null>(null);
  const archiveItemsRef = useRef<HTMLElement[]>([]);
  const prevArchiveItemRef = useRef<number>(-1);

  //------スクロール位置の変化を監視-------
  const prevScrollStartRef = useRef(false);
  const prevGallerySectionRef = useRef(false);
  const prevScrollEndRef = useRef(false);

  //----------現佐のページ----------

  const currentPage = useRecoilValue(currentPageState);

  //----------Recoilの状態を更新するための関数を取得----------
  const setIsScrollStart = useSetRecoilState(isScrollStartAtom);
  const setIsGallerySection = useSetRecoilState(isGallerySectionAtom);
  const setIsScrollEnd = useSetRecoilState(isScrollEndAtom);
  const setTextureTransition = useSetRecoilState(archiveTextureTransitionAtom);

  //----------Reciolの状態を取得----------
  // const isGallerySection = useRecoilValue(isGallerySectionAtom);

  //----------ギャラリーセクションのY座標を計算----------
  const calculateGalleryScrollY = useCallback(() => {
    gallerySectionElementRef.current = document.querySelector('[data-section="gallery"]') || null;

    let gallerySectionY = gallerySectionElementRef.current?.getBoundingClientRect().top ?? 0;

    gallerySectionY += window.scrollY; //ページ遷移時に再計算されるから、その時点でのスクロール量を加算

    gallerySectionScrollYRef.current = gallerySectionY || 0;

    if (gallerySectionElementRef.current == null) {
      setIsGallerySection(false); //ギャラリーセクションが見つからない場合はAtomをfalseにする

      // const needLog: boolean = false;
      // if (needLog) {
      //   console.log(
      //     'gallery section is not found , current atom ->',
      //     isGallerySection,
      //     '\n',
      //     'gallery section (atom) :',
      //     isGallerySection
      //   );
      // }
    }
  }, [setIsGallerySection, gallerySectionElementRef, gallerySectionScrollYRef]);

  //----------アーカイブアイテムのY座標を計算----------
  const calclateArchiveItem = useCallback(() => {
    if (currentPage.title !== 'gallery') {
      setTextureTransition({
        currentIndex: -1,
        targetIndex: -1,
      });

      archiveItemsRef.current = [];

      return;
    }

    const archive = document.querySelector("[data-ui='archive']");

    if (!archive) {
      archiveItemsRef.current = [];

      setTextureTransition({
        currentIndex: -1,
        targetIndex: -1,
      });

      return;
    }

    archiveItemsRef.current = Array.from(archive.querySelectorAll('li'));
  }, [currentPage, setTextureTransition, archiveItemsRef]);

  //----------スクロール連動のメソッドはコチラ ----------
  const updateScrollValues = useCallback(() => {
    const viewportHeight = document.documentElement.clientHeight;
    const documentHeight = document.documentElement.scrollHeight;

    //スクロール量を更新
    scrollRef.current = window.scrollY;
    scrollRatioRef.current = THREE.MathUtils.clamp(scrollRef.current / (viewportHeight * 1), 0, 1);

    //----------FV付近からの離脱を検知----------
    const isScrollStartCurrent = scrollRatioRef.current >= 1;

    if (isScrollStartCurrent !== prevScrollStartRef.current) {
      setIsScrollStart(isScrollStartCurrent);
      prevScrollStartRef.current = isScrollStartCurrent;
    }

    //----------ギャラリーセクションに到達していればtrue----------
    const isGallerySectionCurrent = scrollRef.current >= gallerySectionScrollYRef.current;

    //ギャラリーセクションに到達しているかどうかを更新
    //すでにtrueの場合は更新しない(かつtopページだけ)
    if (
      isGallerySectionCurrent !== prevGallerySectionRef.current &&
      currentPage.title == 'portfolio'
    ) {
      setIsGallerySection(isGallerySectionCurrent);

      prevGallerySectionRef.current = isGallerySectionCurrent;
    }

    //----------フッター付近への到達を検知する----------
    const isScrollEndCurrent =
      scrollRef.current >= documentHeight - viewportHeight - viewportHeight * 0.5;

    if (isScrollEndCurrent !== prevScrollEndRef.current) {
      setIsScrollEnd(isScrollEndCurrent);
      prevScrollEndRef.current = isScrollEndCurrent;
    }

    //----------アーカイブアイテムのスクロール位置を取得----------
    if (currentPage.title == 'gallery' && archiveItemsRef.current.length > 0) {
      const viewportCenter = window.scrollY + viewportHeight / 2; //スクロールに対して、常に画面の中央を取得する（後述で取得される各itemのスクロールYは固定で、viewportCenterと比較してvireportCenterが上回ったら、つまりその要素が画面中央を突破したことになる）

      const activeIndex = archiveItemsRef.current.findIndex((item, index) => {
        const rect = item.getBoundingClientRect();

        const itemTop = rect.top + window.scrollY;

        const nextItem = archiveItemsRef.current[index + 1];

        const nextItemTop = nextItem
          ? nextItem.getBoundingClientRect().top + window.scrollY
          : documentHeight;

        return viewportCenter >= itemTop && viewportCenter < nextItemTop; //画面中央がitemの範囲内にあるかどうかを判定。範囲内にあればtrueを返す=>そのitemのindexがactiveIndexに格納される
      });

      //prevArchiveItemRef.currentは前回のアーカイブアイテムのindexを保持しており、activeIndexと異なる場合は、アーカイブアイテムが変わったことを意味する
      if (activeIndex !== prevArchiveItemRef.current) {
        //アイテムのアクティブ状態を切り替える
        if (
          prevArchiveItemRef.current >= 0 &&
          prevArchiveItemRef.current < archiveItemsRef.current.length
        ) {
          archiveItemsRef.current[prevArchiveItemRef.current].removeAttribute('data-active');
        }
        if (activeIndex >= 0 && activeIndex < archiveItemsRef.current.length) {
          archiveItemsRef.current[activeIndex].setAttribute('data-active', 'true');
        }

        setTextureTransition({
          currentIndex: prevArchiveItemRef.current,
          targetIndex: activeIndex,
        });

        prevArchiveItemRef.current = activeIndex;
      }

      // console.log(
      //   'viewportCenter :',
      //   viewportCenter,
      //   '\n',
      //   'activeIndex :',
      //   activeIndex,
      //   '\n',
      //   'prevArchiveItemRef.current :',
      //   prevArchiveItemRef.current
      // );
    }
  }, [
    currentPage,
    setIsScrollStart,
    setIsGallerySection, //
    setIsScrollEnd, //
    setTextureTransition, //
    // isGallerySection, //
  ]);

  //----------主にページ遷移時にリセットするため---------
  useEffect(() => {
    calculateGalleryScrollY();
    calclateArchiveItem();
    updateScrollValues();
  }, [currentPage, calculateGalleryScrollY, updateScrollValues, calclateArchiveItem]);

  //----------リスナへの登録----------
  useEffect(() => {
    const handleScroll = () => {
      updateScrollValues();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateScrollValues]);

  return (
    <ScrollContext.Provider
      value={{
        position: scrollRef,
        ratio: scrollRatioRef,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => useContext(ScrollContext);
