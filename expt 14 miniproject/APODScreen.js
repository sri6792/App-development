// screens/APODScreen.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Animated,
  Modal,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 300; // medium size chosen

const NASA_API_KEY = "3aXtMTzwWLcKgoHE0CzQSgdVHLGMTBL7EofFhY8c"; // <-- replace with your key

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function daysAgoDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return isoDate(d);
}

function buildMonthMatrix(year, month) {
  // returns array of weeks, each week is 7 entries (0 means empty)
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0..6 (Sun..Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let week = new Array(7).fill(null);
  let day = 1;
  for (let i = startDay; i < 7; i++) {
    week[i] = day++;
  }
  weeks.push(week);
  while (day <= daysInMonth) {
    week = new Array(7).fill(null);
    for (let i = 0; i < 7 && day <= daysInMonth; i++) {
      week[i] = day++;
    }
    weeks.push(week);
  }
  return weeks;
}

export default function APODScreen() {
  const navigation = useNavigation();

  const [todayApod, setTodayApod] = useState(null);
  const [pastApods, setPastApods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // YYYY-MM-DD
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    // initial load: today's APOD + past 10 days
    loadTodayAndPast();
  }, []);

  useEffect(() => {
    // hero animation when todayApod changes
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, [todayApod]);

  const loadTodayAndPast = async () => {
    setLoading(true);
    try {
      // Today's APOD
      const todayRes = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
      );
      const todayJson = await todayRes.json();

      // Past 10 days (use start_date and end_date)
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 9); // last 10 days including today
      const startStr = isoDate(start);
      const endStr = isoDate(end);

      const rangeRes = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${startStr}&end_date=${endStr}`
      );
      let rangeJson = await rangeRes.json(); // array

      // Normalize: API returns array if start_date provided, otherwise object
      if (!Array.isArray(rangeJson)) rangeJson = [rangeJson];

      // Only images, newest first
      const imgs = rangeJson
        .filter((i) => i && i.media_type === "image")
        .sort((a, b) => (a.date < b.date ? 1 : -1));

      // If today's APOD is image, set as hero, otherwise pick first image in imgs
      if (todayJson && todayJson.media_type === "image") {
        setTodayApod(todayJson);
      } else {
        setTodayApod(imgs[0] || null);
      }

      // Past list: exclude the hero image to avoid duplication
      const heroDate = (todayJson && todayJson.media_type === "image" && todayJson.date) || (imgs[0] && imgs[0].date) || null;
      const list = imgs.filter((i) => i.date !== heroDate);
      setPastApods(list);
    } catch (e) {
      console.log("APOD load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchApodForDate = async (dateStr) => {
    // dateStr = YYYY-MM-DD
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${dateStr}`
      );
      const json = await res.json();
      if (json && json.media_type === "image") {
        setTodayApod(json);
        // refresh past list around selected date: last 10 days ending at selected date
        const end = new Date(dateStr);
        const start = new Date(end);
        start.setDate(end.getDate() - 9);
        const startStr = isoDate(start);
        const endStr = isoDate(end);
        const rangeRes = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${startStr}&end_date=${endStr}`
        );
        let rangeJson = await rangeRes.json();
        if (!Array.isArray(rangeJson)) rangeJson = [rangeJson];
        const imgs = rangeJson.filter((i) => i && i.media_type === "image").sort((a,b) => (a.date<b.date?1:-1));
        const list = imgs.filter((i) => i.date !== json.date);
        setPastApods(list);
      } else {
        // not image — show message and keep current hero
        alert("Selected date's APOD is not an image. Please pick another date.");
      }
    } catch (e) {
      console.log("fetchApodForDate error:", e);
      alert("Unable to load APOD for selected date.");
    } finally {
      setLoading(false);
    }
  };

  // Calendar helpers
  const openCalendar = () => setModalOpen(true);
  const closeCalendar = () => setModalOpen(false);
  const prevMonth = () =>
    setCalendarMonth((s) => {
      const m = s.month - 1;
      if (m < 0) return { year: s.year - 1, month: 11 };
      return { year: s.year, month: m };
    });
  const nextMonth = () =>
    setCalendarMonth((s) => {
      const m = s.month + 1;
      if (m > 11) return { year: s.year + 1, month: 0 };
      return { year: s.year, month: m };
    });

  const onPickDay = (day) => {
    if (!day) return;
    const { year, month } = calendarMonth;
    const picked = new Date(year, month, day);
    const pickedStr = isoDate(picked);
    setSelectedDate(pickedStr);
  };

  const confirmPick = () => {
    if (!selectedDate) {
      alert("Pick a date first.");
      return;
    }
    closeCalendar();
    fetchApodForDate(selectedDate);
  };

  const renderPastItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.pastCard}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate("APODDetail", {
            title: item.title,
            description: item.explanation,
            date: item.date,
            image: item.url,
          })
        }
      >
        <Image source={{ uri: item.url }} style={styles.pastImage} />
        <Text style={styles.pastTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  // calendar matrix
  const weeks = buildMonthMatrix(calendarMonth.year, calendarMonth.month);
  const monthName = new Date(calendarMonth.year, calendarMonth.month).toLocaleString(undefined, { month: "long" });

  return (
    <LinearGradient colors={["#0a0220", "#15063a", "#1a094d"]} style={styles.container}>
      <StatusBar translucent barStyle="light-content" />
      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={26} color="#7DF9FF" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Animated.View style={{ opacity: fade, transform: [{ scale }] }}>
          <Text style={styles.title}>Astronomy Picture of the Day</Text>
          <Text style={styles.subtitle}>Featured (today or latest image)</Text>

          {loading && !todayApod ? (
            <ActivityIndicator color="#7DF9FF" size="large" style={{ marginTop: 28 }} />
          ) : todayApod ? (
            <TouchableOpacity
              activeOpacity={0.95}
              style={styles.heroCard}
              onPress={() =>
                navigation.navigate("APODDetail", {
                  title: todayApod.title,
                  description: todayApod.explanation,
                  date: todayApod.date,
                  image: todayApod.url,
                })
              }
            >
              <Image source={{ uri: todayApod.url }} style={styles.heroImage} />
              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle} numberOfLines={2}>{todayApod.title}</Text>
                <Text style={styles.heroDate}>{todayApod.date}</Text>
                <Text style={styles.heroExcerpt} numberOfLines={3}>
                  {todayApod.explanation?.replace(/<[^>]*>/g, " ") || ""}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.noHero}>
              <Text style={{ color: "#fff" }}>No image APOD found.</Text>
            </View>
          )}
        </Animated.View>

        {/* Controls: Pick Date button */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.pickerBtn} onPress={openCalendar}>
            <Ionicons name="calendar" size={18} color="#7DF9FF" />
            <Text style={styles.pickerText}>Pick a date</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pickerBtn, { backgroundColor: "rgba(255,255,255,0.04)" }]}
            onPress={loadTodayAndPast}
          >
            <Ionicons name="refresh" size={18} color="#7DF9FF" />
            <Text style={styles.pickerText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Past APODs grid */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Recent APODs</Text>
        {loading && pastApods.length === 0 ? (
          <ActivityIndicator color="#7DF9FF" style={{ marginTop: 18 }} />
        ) : (
          <FlatList
            data={pastApods}
            keyExtractor={(i) => i.date}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            renderItem={renderPastItem}
            contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
          />
        )}
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={prevMonth}><Ionicons name="chevron-back" size={20} color="#fff" /></TouchableOpacity>
              <Text style={styles.modalTitle}>{monthName} {calendarMonth.year}</Text>
              <TouchableOpacity onPress={nextMonth}><Ionicons name="chevron-forward" size={20} color="#fff" /></TouchableOpacity>
            </View>

            <View style={styles.weekDays}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <Text key={d} style={styles.weekDayText}>{d}</Text>
              ))}
            </View>

            <View style={{ marginTop: 6 }}>
              {weeks.map((week, wi) => (
                <View key={wi} style={styles.weekRow}>
                  {week.map((day, di) => {
                    const dayStr = day ? (new Date(calendarMonth.year, calendarMonth.month, day)) : null;
                    const dateKey = dayStr ? isoDate(dayStr) : null;
                    const isSelected = dateKey === selectedDate;
                    return (
                      <Pressable
                        key={di}
                        style={[styles.dayBox, isSelected && styles.dayBoxSelected]}
                        onPress={() => onPickDay(day)}
                      >
                        <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                          {day || ""}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => { setSelectedDate(isoDate(new Date())); }}>
                <Text style={styles.modalBtnText}>Today</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#7c3aed" }]} onPress={confirmPick}>
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Load</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalBtn} onPress={closeCalendar}>
                <Text style={styles.modalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: (StatusBar.currentHeight || 44) + 12, paddingHorizontal: 16, backgroundColor: "#03021a" },
  backButton: { marginBottom: 6, width: 40, height: 40, justifyContent: "center" },

  title: { color: "#e6f0ff", fontSize: 24, fontWeight: "800" },
  subtitle: { color: "#bfcdf5", fontSize: 13, marginTop: 4, marginBottom: 12 },

  heroCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)"
  },
  heroImage: { width: "100%", height: HERO_HEIGHT, resizeMode: "cover" },
  heroInfo: { padding: 12 },
  heroTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  heroDate: { color: "#9fbffb", marginTop: 6, fontSize: 12 },
  heroExcerpt: { color: "#d0dbff", marginTop: 8, fontSize: 13 },

  noHero: { alignItems: "center", justifyContent: "center", height: HERO_HEIGHT },

  controls: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  pickerBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "white", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },

  sectionTitle: { color: "#cbd9ff", fontSize: 16, fontWeight: "700", marginBottom: 8 },

  pastCard: { width: (width - 48) / 2, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, marginBottom: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.03)" },
  pastImage: { width: "100%", height: 140 },
  pastTitle: { color: "#fff", padding: 8, fontSize: 12, fontWeight: "700" },

  /* Modal calendar */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalCard: { width: width - 40, backgroundColor: "#07021a", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.04)" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  modalTitle: { color: "#e6f0ff", fontWeight: "700" },
  weekDays: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  weekDayText: { color: "#9fbffb", width: (width - 72) / 7, textAlign: "center", fontSize: 12 },

  weekRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  dayBox: { width: (width - 72) / 7, height: 36, justifyContent: "center", alignItems: "center", borderRadius: 6 },
  dayBoxSelected: { backgroundColor: "rgba(125,249,255,0.12)" },
  dayText: { color: "#dbe8ff" },
  dayTextSelected: { color: "#0d1720", fontWeight: "700" },

  modalFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.04)" },
  modalBtnText: { color: "#e6f0ff", fontWeight: "700" },
});
