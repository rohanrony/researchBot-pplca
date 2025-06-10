import Redis from 'ioredis';
import { getRedisUrl } from '../config';

const redis = new Redis(getRedisUrl());

export default redis;
