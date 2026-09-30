import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, BookOpen, Clock, Settings, LogOut, ShieldCheck, Coins, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { userApi } from '../lib/resources';
import { getAvatarUrl } from '../lib/avatar';
