// src/screens/LessonsPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Platform } from 'react-native';
import { API_URL } from '../constants/api';
import RichContentDisplay from '../components/RichContentDisplay';

type ImagePosition = 'top' | 'bottom' | 'left' | 'right';

interface Option {
  id: number;
  option_text: string;
}

interface Question {
  id: number;
  question_text: string;
  points: number;
  options: Option[];
}

interface Quiz {
  id: number;
  title: string;
  passing_score: number;
  questions: Question[];
}

interface Topic {
  id: number;
  parent_topic_id: number | null;
  title: string;
  slug: string;
  content: string;
  title_text_size: number;
  content_text_size: number;
  subtopics?: Topic[];
  image_url: string | null;
  image_position: ImagePosition;
  youtube_url: string | null;
  images: TopicImage[];
  quiz?: Quiz | null;
}

function getYouTubeId(url: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return match?.[1] || null;
}

function InlineYouTubeVideo({ videoId }: { videoId: string }) {
  const [playing, setPlaying] = useState(false);

  if (Platform.OS !== 'web') {
    return (
      <TouchableOpacity style={styles.youtubeContainer} onPress={() => setPlaying(true)}>
        <Image source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }} style={styles.youtubeThumbnail} resizeMode="contain" />
        <Text style={styles.youtubeCaption}>Play video</Text>
      </TouchableOpacity>
    );
  }

  if (!playing) {
    return (
      <TouchableOpacity style={styles.youtubeContainer} onPress={() => setPlaying(true)}>
        <Image source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }} style={styles.youtubeThumbnail} resizeMode="contain" />
        <Text style={styles.youtubeCaption}>Play video</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.youtubeContainer}>
      <iframe
        title="YouTube lesson video"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        style={styles.youtubePlayer as React.CSSProperties}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </View>
  );
}

interface TopicImage {
  id: number;
  image_url: string;
  image_position: ImagePosition;
  image_width: number;
  sort_order: number;
}

interface QuizSubmissionResult {
  score: number;
  totalPoints: number;
  passed: boolean;
  percentage?: number;
  correctAnswers?: Record<number, number>;
}

interface ResponsiveTopicImageProps {
  uri: string;
  subtopic: boolean;
  sideBySide?: boolean;
  width: number;
}

function ResponsiveTopicImage({ uri, subtopic, sideBySide, width }: ResponsiveTopicImageProps) {
  const [aspectRatio, setAspectRatio] = useState(1);

  return (
    <Image
      source={{ uri }}
      resizeMode="contain"
      onLoad={(event) => {
        const source = event.nativeEvent?.source;
        if (source && source.width > 0 && source.height > 0) {
          setAspectRatio(source.width / source.height);
        }
      }}
      style={[
        subtopic ? styles.subtopicImage : styles.topicImage,
        sideBySide && styles.sideBySideImage,
        { aspectRatio, width: `${width}%` }
      ]}
    />
  );
}

export default function LessonsPage({ userId = 1 }: { userId?: number }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);
  const contentScrollRef = useRef<ScrollView>(null);

  const rootTopics = topics.filter((topic) => topic.parent_topic_id === null);
  const childTopics = (parentId: number) => topics.filter((topic) => topic.parent_topic_id === parentId);

  useEffect(() => {
    fetch(`${API_URL}/topics`)
      .then((res) => res.json())
      .then((data: Topic[]) => setTopics(data))
      .catch((err) => console.error(err));
  }, []);

  const loadTopicDetails = async (topicId: number) => {
    contentScrollRef.current?.scrollTo({ y: 0, animated: false });
    setLoading(true);
    setQuizResult(null);
    setSelectedAnswers({});
    setShowQuiz(false);
    try {
      const res = await fetch(`${API_URL}/topics/${topicId}/quiz`);
      const data = await res.json();
      setActiveTopic(data.topic);
      setQuizData(data.quiz);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionId: number) => {
    if (quizResult !== null) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const submitQuiz = async () => {
    if (!quizData || submittingQuiz) return;
    setSubmittingQuiz(true);
    try {
      const res = await fetch(`${API_URL}/quizzes/${quizData.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, answers: selectedAnswers })
      });
      const result: QuizSubmissionResult = await res.json();

      let correctAnswers = result.correctAnswers;
      if (!correctAnswers) {
        try {
          const quizRes = await fetch(`${API_URL}/quizzes/${quizData.id}`);
          if (quizRes.ok) {
            const fullQuiz = await quizRes.json();
            correctAnswers = {};
            fullQuiz.questions?.forEach((q: { id: number; options?: Array<{ id: number; is_correct: number | boolean }> }) => {
              const correctOpt = q.options?.find((opt) => Boolean(opt.is_correct));
              if (correctOpt) {
                correctAnswers![q.id] = correctOpt.id;
              }
            });
          }
        } catch (e) {
          console.error('Error fetching quiz details:', e);
        }
      }
      setQuizResult({ ...result, correctAnswers });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizResult(null);
    setSelectedAnswers({});
  };

  const handleSelectQuiz = (quiz: Quiz) => {
    setQuizData(quiz);
    setQuizResult(null);
    setSelectedAnswers({});
    setShowQuiz(true);
    requestAnimationFrame(() => contentScrollRef.current?.scrollToEnd({ animated: true }));
  };

  const renderTopicContent = (topic: Topic, subtopic = false) => {
    const images = topic.images?.length > 0
      ? topic.images
      : topic.image_url
        ? [{ id: 0, image_url: topic.image_url, image_position: topic.image_position, image_width: 100, sort_order: 0 }]
        : [];
    const renderImage = (image: TopicImage, sideBySide = false) => (
      <ResponsiveTopicImage
        key={image.id}
        uri={`${API_URL.replace(/\/api$/, '')}${image.image_url}`}
        subtopic={subtopic}
        sideBySide={sideBySide}
        width={image.image_width || 100}
      />
    );
    const topImages = images.filter((image) => image.image_position === 'top');
    const bottomImages = images.filter((image) => image.image_position === 'bottom');
    const leftImages = images.filter((image) => image.image_position === 'left');
    const rightImages = images.filter((image) => image.image_position === 'right');
    const text = <RichContentDisplay html={topic.content} fontSize={topic.content_text_size || 18} />;
    const youtubeId = getYouTubeId(topic.youtube_url);
    const youtubeThumbnail = youtubeId ? <InlineYouTubeVideo videoId={youtubeId} /> : null;

    return (
      <>
        {youtubeThumbnail}
        {topImages.map((image) => renderImage(image))}
        <View style={styles.sideBySideContent}>
          {leftImages.length > 0 && <View style={styles.sideImageColumn}>{leftImages.map((image) => renderImage(image, true))}</View>}
          <View style={styles.sideBySideText}>{text}</View>
          {rightImages.length > 0 && <View style={styles.sideImageColumn}>{rightImages.map((image) => renderImage(image, true))}</View>}
        </View>
        {bottomImages.map((image) => renderImage(image))}
      </>
    );
  };

  return (
    <View nativeID="lessons-page" style={styles.pageContainer}>
      <View nativeID="topics-sidebar" style={styles.sidebar}>
        <Text style={styles.sidebarHeader}>Available Topics</Text>
        <ScrollView contentContainerStyle={styles.sidebarScrollContent}>
          <View style={styles.topicsRow}>
          {rootTopics.map((topic) => (
            <View key={topic.id} style={styles.topicGroup}>
              <TouchableOpacity style={styles.topicCard} onPress={() => loadTopicDetails(topic.id)}>
                <Text style={styles.topicCardTitle}>{topic.title}</Text>
              </TouchableOpacity>
              <View style={styles.subtopicsContainer}>
                {childTopics(topic.id).map((subtopic) => (
                  <TouchableOpacity
                    key={subtopic.id}
                    style={styles.subtopicCard}
                    onPress={() => loadTopicDetails(subtopic.id)}
                  >
                    <Text style={styles.subtopicCardTitle}>{subtopic.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          </View>
        </ScrollView>
      </View>

      <View nativeID="topics-main" style={styles.mainContainer}>
        <ScrollView ref={contentScrollRef} contentContainerStyle={styles.mainScrollContent}>
          <View style={styles.contentWrapper}>
            {loading && <ActivityIndicator size="large" color="#a84bab" style={{ marginTop: 20 }} />}

            {!activeTopic && !loading && (
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Welcome to Lessons</Text>
                <Text style={styles.welcomeText}>Select a topic from the sidebar to begin learning.</Text>
              </View>
            )}

            {activeTopic && (
              <View style={styles.contentSection}>
          <Text style={[styles.topicTitle, { fontSize: activeTopic.title_text_size || 24 }]}>{activeTopic.title}</Text>
          {renderTopicContent(activeTopic)}

          {activeTopic.subtopics && activeTopic.subtopics.length > 0 && (
            <View style={styles.subtopicsContent}>
              <Text style={styles.subtopicsHeader}>Subtopics</Text>
              {activeTopic.subtopics.map((subtopic) => (
                <View key={subtopic.id} style={styles.subtopicContentBlock}>
                  <Text style={[styles.subtopicTitle, { fontSize: subtopic.title_text_size || 18 }]}>{subtopic.title}</Text>
                  {renderTopicContent(subtopic, true)}
                  {subtopic.quiz && (
                    <TouchableOpacity
                      style={styles.subtopicQuizBtn}
                      onPress={() => {
                        if (subtopic.quiz) {
                          handleSelectQuiz(subtopic.quiz);
                        }
                      }}
                    >
                      <Text style={styles.subtopicQuizBtnText}>Take Quiz: {subtopic.quiz.title}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {quizData && !showQuiz && (
            <TouchableOpacity 
              style={styles.takeQuizBtn} 
              onPress={() => setShowQuiz(true)}
            >
              <Text style={styles.takeQuizBtnText}>Take Quiz</Text>
            </TouchableOpacity>
          )}

          {quizData && showQuiz && (
            <View style={styles.quizBox}>
              <View style={styles.quizHeaderRow}>
                <Text style={styles.quizHeader}>Quiz: {quizData.title}</Text>
                <Text style={styles.quizPassingNotice}>
                  Passing Score: {quizData.passing_score}%
                </Text>
              </View>

              {quizData.questions.map((q, idx) => {
                const isSubmitted = quizResult !== null;
                const correctOptionId = quizResult?.correctAnswers?.[q.id];
                const userSelectedOptionId = selectedAnswers[q.id];
                const isQuestionAnswered = userSelectedOptionId !== undefined;
                const isQuestionCorrect = isSubmitted && isQuestionAnswered && Number(userSelectedOptionId) === Number(correctOptionId);

                return (
                  <View key={q.id} style={styles.questionBlock}>
                    <View style={styles.questionTitleRow}>
                      <Text style={styles.questionTitle}>
                        {idx + 1}. {q.question_text} ({q.points} {q.points === 1 ? 'pt' : 'pts'})
                      </Text>
                      {isSubmitted && (
                        <View style={[styles.questionStatusBadge, isQuestionCorrect ? styles.badgeSuccess : styles.badgeDanger]}>
                          <Text style={[styles.questionStatusText, isQuestionCorrect ? styles.badgeTextSuccess : styles.badgeTextDanger]}>
                            {isQuestionCorrect ? '✓ Correct' : '✕ Incorrect'}
                          </Text>
                        </View>
                      )}
                    </View>

                    {q.options.map((opt) => {
                      const isSelected = Number(userSelectedOptionId) === opt.id;
                      const isCorrect = isSubmitted && Number(correctOptionId) === opt.id;
                      const isWrongSelected = isSubmitted && isSelected && !isCorrect;

                      return (
                        <TouchableOpacity
                          key={opt.id}
                          disabled={isSubmitted}
                          style={[
                            styles.optionButton,
                            isSelected && !isSubmitted && styles.optionSelected,
                            isCorrect && styles.optionCorrect,
                            isWrongSelected && styles.optionWrongSelected,
                            isSubmitted && !isCorrect && !isWrongSelected && styles.optionMuted
                          ]}
                          onPress={() => handleSelectOption(q.id, opt.id)}
                        >
                          <View style={styles.optionContentRow}>
                            <Text
                              style={[
                                styles.optionText,
                                isSelected && !isSubmitted && styles.optionTextSelected,
                                isCorrect && styles.optionTextCorrect,
                                isWrongSelected && styles.optionTextWrong
                              ]}
                            >
                              {opt.option_text}
                            </Text>

                            {isCorrect && (
                              <View style={styles.correctPill}>
                                <Text style={styles.correctPillText}>
                                  {isSelected ? '✓ Correct Answer (Your Choice)' : '✓ Correct Answer'}
                                </Text>
                              </View>
                            )}

                            {isWrongSelected && (
                              <View style={styles.wrongPill}>
                                <Text style={styles.wrongPillText}>✕ Your Choice</Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}

              {!quizResult ? (
                <TouchableOpacity
                  style={[styles.submitBtn, submittingQuiz && styles.submitBtnDisabled]}
                  onPress={submitQuiz}
                  disabled={submittingQuiz}
                >
                  {submittingQuiz ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Quiz</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={[styles.resultBox, quizResult.passed ? styles.resultBoxPassed : styles.resultBoxFailed]}>
                  <View style={styles.resultHeaderRow}>
                    <Text style={[styles.resultBadge, quizResult.passed ? styles.resultBadgePassed : styles.resultBadgeFailed]}>
                      {quizResult.passed ? '✓ PASSED' : '✕ NEEDS PRACTICE'}
                    </Text>
                    <Text style={styles.resultScoreText}>
                      Score: {quizResult.score} / {quizResult.totalPoints} (
                      {Math.round(
                        quizResult.percentage ??
                          (quizResult.totalPoints > 0 ? (quizResult.score / quizResult.totalPoints) * 100 : 0)
                      )}
                      %)
                    </Text>
                  </View>

                  <Text style={styles.resultNoticeText}>
                    {quizResult.passed
                      ? `Great job! You met the passing requirement of ${quizData.passing_score}%. Review the highlighted correct answers above.`
                      : `You scored below the passing threshold of ${quizData.passing_score}%. Review the highlighted correct answers above in green and try again.`}
                  </Text>

                  <TouchableOpacity style={styles.retakeBtn} onPress={handleRetakeQuiz}>
                    <Text style={styles.retakeBtnText}>↻ Retake Quiz</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: { flex: 1, flexDirection: 'row', backgroundColor: 'transparent' },
  sidebar: { width: 320, position: 'fixed' as any, top: 84, left: 18, bottom: 18, backgroundColor: '#F8F7FC', borderRadius: 16, elevation: 4, zIndex: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.65)', overflow: 'hidden', shadowColor: '#0f0a1e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.24, shadowRadius: 20 } as any,
  sidebarScrollContent: { padding: 20 },
  sidebarHeader: { fontSize: 20, fontWeight: '800', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, color: '#412653', backgroundColor: '#F0EEF6', borderBottomWidth: 1, borderBottomColor: '#e6e1eb' },
  mainContainer: { flex: 1, backgroundColor: 'transparent', marginLeft: 352 },
  mainScrollContent: { flexGrow: 1 },
  contentWrapper: { maxWidth: 1400, width: '100%', alignSelf: 'center', padding: 32, paddingTop: 84 },
  welcomeSection: { marginTop: 10, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#F8F7FC', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.75)', borderTopWidth: 3, borderTopColor: '#e0563f', shadowColor: '#0f0a1e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 20 } as any,
  welcomeTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12, color: '#412653' },
  welcomeText: { fontSize: 18, color: '#686775', textAlign: 'center' },
  topicList: { marginBottom: 24 },
  sectionHeader: { fontSize: 24, fontWeight: '800', marginBottom: 16, color: '#412653' },
  topicsRow: { flexDirection: 'column', gap: 20 },
  topicGroup: { backgroundColor: '#F8F7FC', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.75)', borderTopWidth: 3, borderTopColor: '#a84bab', shadowColor: '#0f0a1e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 18, elevation: 3 } as any,
  topicCard: { marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee9f0' },
  topicCardTitle: { fontSize: 22, fontWeight: '800', color: '#242432', letterSpacing: -0.5 },
  subtopicsContainer: { flexDirection: 'column', gap: 12, alignItems: 'flex-start' },
  subtopicCard: { backgroundColor: '#F0EEF6', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 100, borderWidth: 1, borderColor: '#e6e1eb', shadowColor: '#412653', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  subtopicCardTitle: { color: '#a84bab', fontSize: 15, fontWeight: '700' },
  contentSection: { marginTop: 16, padding: 32, backgroundColor: '#F8F7FC', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.75)', borderTopWidth: 3, borderTopColor: '#a84bab', shadowColor: '#0f0a1e', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 4 } as any,
  topicTitle: { fontSize: 32, fontWeight: '800', marginBottom: 20, color: '#412653', letterSpacing: -0.5 },
  topicContent: { fontSize: 18, lineHeight: 30, color: '#334155' },
  subtopicsContent: { marginTop: 32, borderTopWidth: 1, borderTopColor: '#eee9f0', paddingTop: 28 },
  subtopicsHeader: { fontSize: 24, fontWeight: '800', marginBottom: 16, color: '#412653' },
  subtopicContentBlock: { marginBottom: 28, padding: 24, backgroundColor: '#F0EEF6', borderRadius: 12, borderWidth: 1, borderColor: '#e6e1eb', shadowColor: '#412653', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 1 } as any,
  subtopicTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#412653' },
  topicImage: { width: '100%', borderRadius: 8, marginBottom: 16, backgroundColor: '#f1f5f9' },
  subtopicImage: { width: '100%', borderRadius: 6, marginBottom: 8, backgroundColor: '#f1f5f9' },
  sideBySideContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 8 },
  sideImageColumn: { width: '28%', gap: 8 },
  sideBySideImage: { width: '100%', marginBottom: 0 },
  sideBySideText: { flex: 1 },
  youtubeContainer: { alignItems: 'center', marginVertical: 10 },
  youtubeThumbnail: { width: '50%', aspectRatio: 16 / 9, alignSelf: 'center', borderRadius: 6 },
  youtubeCaption: { textAlign: 'center', marginTop: 5, color: '#1e293b' },
  youtubePlayer: { width: '50%', aspectRatio: 16 / 9, alignSelf: 'center', borderWidth: 0 },
  quizBox: { marginTop: 32, borderTopWidth: 1, borderTopColor: '#e6e1eb', paddingTop: 20 },
  quizHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  quizHeader: { fontSize: 20, fontWeight: 'bold', color: '#412653' },
  quizPassingNotice: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  questionBlock: { marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(241, 245, 249, 0.6)' },
  questionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 },
  questionTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1e293b' },
  questionStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeSuccess: { backgroundColor: 'rgba(220, 252, 231, 0.8)' },
  badgeDanger: { backgroundColor: 'rgba(254, 226, 226, 0.8)' },
  questionStatusText: { fontSize: 12, fontWeight: '700' },
  badgeTextSuccess: { color: '#15803d' },
  badgeTextDanger: { color: '#b91c1c' },
  optionButton: { padding: 14, borderWidth: 1.5, borderColor: '#e6e1eb', borderRadius: 8, marginVertical: 4, backgroundColor: '#FAFAFC' },
  optionSelected: { backgroundColor: '#f8eff8', borderColor: '#a84bab' },
  optionTextSelected: { color: '#79377d', fontWeight: '600' },
  optionCorrect: { backgroundColor: 'rgba(236, 253, 245, 0.8)', borderColor: '#16a34a', borderWidth: 2 },
  optionTextCorrect: { color: '#14532d', fontWeight: '700' },
  optionWrongSelected: { backgroundColor: 'rgba(254, 242, 242, 0.8)', borderColor: '#ef4444', borderWidth: 2 },
  optionTextWrong: { color: '#991b1b', fontWeight: '600' },
  optionMuted: { backgroundColor: 'rgba(248, 250, 252, 0.5)', borderColor: 'rgba(226, 232, 240, 0.5)', opacity: 0.8 },
  optionContentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  optionText: { flex: 1, color: '#0f172a', fontSize: 15 },
  correctPill: { backgroundColor: '#16a34a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  correctPillText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  wrongPill: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  wrongPillText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  submitBtn: { backgroundColor: '#e0563f', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  resultBox: { marginTop: 20, padding: 18, borderRadius: 12, borderWidth: 1 },
  resultBoxPassed: { backgroundColor: 'rgba(240, 253, 244, 0.8)', borderColor: '#86efac' },
  resultBoxFailed: { backgroundColor: 'rgba(254, 242, 242, 0.8)', borderColor: '#fca5a5' },
  resultHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  resultBadge: { fontSize: 14, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  resultBadgePassed: { backgroundColor: 'rgba(220, 252, 231, 0.9)', color: '#16a34a' },
  resultBadgeFailed: { backgroundColor: 'rgba(254, 226, 226, 0.9)', color: '#dc2626' },
  resultScoreText: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  resultNoticeText: { fontSize: 14, color: '#334155', lineHeight: 20, marginBottom: 14 },
  retakeBtn: { backgroundColor: '#3f567f', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignSelf: 'flex-start' },
  retakeBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  takeQuizBtn: { backgroundColor: '#e0563f', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  takeQuizBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  subtopicQuizBtn: { backgroundColor: '#e0563f', paddingVertical: 11, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start', marginTop: 16 },
  subtopicQuizBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' }
} as any);